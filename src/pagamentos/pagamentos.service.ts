import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import mercadopago from 'mercadopago';
import { TransacaoPagamento } from './entities/transacao-pagamento.entity';
import { Fatura } from '../financeiro/entities/fatura.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { CriarPagamentoDto } from './dto/criar-pagamento.dto';
import { WebhookPagamentoDto } from './dto/webhook-pagamento.dto';
import { HistoricoService } from '../historico/historico.service';
import { title } from 'process';
import { url } from 'inspector';

@Injectable()
export class PagamentosService {
    private reandonly logger = new Logger(PagamentosService.name);

    constructor(
        private configService: ConfigService,
        @InjectRepository(TransacaoPagamento)
        private transacaoRepository: Repository<TransacaoPagamento>,
        @InjectRepository(Fatura)
        private faturasRepository: Repository<Fatura>,
        @InjectRepository(Cliente)
        private clientesRepository: Repository<Cliente>,
        private historicoService: HistoricoService,
    ){
        this.configurarMercadoPago();
    }

    private configurarMercadoPago() {
        const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
        
        if (!accessToken) {
            this.logger.warn('MERCADOPAGO_ACCESS_TOKEN não configurado. Pagamentos desativados.');
            return;
        }

        mercadopago.configure({
            access_token: accessToken,
        })

        this.logger.log('Mercado Pago configurado com sucesso.');
    }

    async criarPagamento(criarPagamentoDto: CriarPagamentoDto): Promise<any> {
        try {
            const fatura = await this.faturasRepository.findOne({ where: { id: criarPagamentoDto.faturaId }, relations: ['cliente'] });

            if (!fatura) {
                throw new BadRequestException('Fatura não encontrada.');
            }

            if (fatura.paga) {
                throw new BadRequestException('Fatura já está paga.');
            }

            const prefrence = {
                items: [
                    {
                        title: `Fatura #${fatura.id} - ${fatura.cliente.nome}`,
                        unit_price: parseFloat(fatura.valor.toString()),
                        quantity: 1,
                        currency_id: 'BRL',
                    },
                ],
                payer: {
                    name: fatura.cliente.nome,
                    email: fatura.cliente.email || 'cliente@exemplo.com',
                },
                external_reference: fatura.id.toString(),
                notification_url: `${this.configService.get('APP_URL')}/pagamentos/webhook`,
                back_urls: {
                    success: `${this.configService.get('FRONTEND_URL')}/pagamento/sucesso`,
                    failure: `${this.configService.get('FRONTEND_URL')}/pagamento/falha`,
                    pending: `${this.configService.get('FRONTEND_URL')}/pagamento/pendente`,
                },
                auto_return: 'approved',
            };

            const response = await mercadopago.preferences.create(prefrence);

            const transacao = this.transacaoRepository.create({
                faturaId: fatura.id,
                clienteId: fatura.cliente.id,
                transacaoId: response.body.id,
                status: 'peding',
                valor: fatura.valor,
                urlPagamento: response.body.init_point,
                dadosPagamento: response.body,

            });

            await this.transacaoRepository.save(transacao);

            this.historicoService.registrar(
                'PAGAMENTO_CRIADO',
                `Pagamento criado para fatura #${fatura.id} - Valor: R$ ${fatura.valor}.`,
                fatura.clienteId,
            );

            this.logger.log(`Pagamento criado para fatura ${fatura.id}`);
            
            return {
                id: transacao.id,
                urlPagamento: response.body.init_point,
                transacaoId: response.body.id,
                status: 'peding',
            };
        } catch (error) {
            this.logger.error(`Erro ao criar pagamento: ${error.message}`);
            throw new BadRequestException('Erro ao criar pagamento.');
        }
    }

    async processarWebhook(webhookPagamentoDto: WebhookPagamentoDto): Promise<void> {
        try {
            this.logger.log(`Processando webhook: ${JSON.stringify(WebhookPagamentoDto)}`);

            if (webhookPagamentoDto.type === 'payment') {
                const paymentId = webhookPagamentoDto.data.id;

                const payment = await mercadopago.payment.findById(paymentId);
                const paymentData = payment.body;

                const transacao = await this.transacaoRepository.findOne({
                    where: {
                        transacaoId: paymentData.external_reference
                    }
                    relations: ['fatura', 'cliente'],
                });

                if (!transacao) {
                    this.logger.error(`Transação não encontrada para o pagamento ID: ${paymentData.external_reference}`);
                    return;
                }

                transacao.status = paymentData.status;
                transacao.dataAtualizacao = new Date();
                transacao.dadosPagamento = paymentData;

                if (paymentData.status === 'approved') {
                    transacao.dataPagamento = new Date();

                    const fatura = transacao.fatura;
                    fatura.paga = true;
                    fatura.dataPagamento = new Date();
                    
                    await this.faturasRepository.save(fatura);

                    this.historicoService.registrar(
                        'PAGAMENTO_APROVADO',
                        `Pagamento aprovado para fatura #${fatura.id} - Valor: R$ ${fatura.valor}.`,
                        transacao.clienteId,
                    );

                    this.logger.log(`Pagamento aprovado para fatura ${fatura.id}`);
                    
                }

                await this.transacaoRepository.save(transacao);
            }
            
        } catch (error) {
            this.logger.error(`Erro ao processar webhook: ${error.message}`);
        }
    }

    async verificarStatus(transacaoId: string): Promise<any> {
        const transacao = await this.transacaoRepository.findOne({ 
            where: { transacaoId },
            relations: ['fatura'],
        });

        if (!transacao) {
            throw new BadRequestException('Transação não encontrada.');
        }

        return {
            transacaoId: transacao.transacaoId,
            status: transacao.status,
            faturaId: transacao.fatura.id,
            valor: transacao.valor,
            urlPagamento: transacao.urlPagamento,
            dataCriacao? : transacao.dataCriacao,
            dataPagamento: transacao.dataPagamento,
        };
    }

    async listarTransacoes(clienteId: number): Promise<TransacaoPagamento[]> {
        return this.transacaoRepository.find({
            where: { clienteId },
            relations: ['fatura'],
            order: { dataCriacao: 'DESC' },
        });
    }

}