import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

import { TransacaoPagamento } from './entities/transacao-pagamento.entiity';
import { Fatura } from '../financeiro/entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { CriarPagamentoDto } from './dto/criar-pagamento.dto';
import { WebhookPagamentoDto } from './dto/webhook-pagamento.dto';
import { HistoricoService } from '../historico/historico-service';

@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);
  private mpClient: MercadoPagoConfig;

  constructor(
    private configService: ConfigService,
    @InjectRepository(TransacaoPagamento)
    private transacaoRepository: Repository<TransacaoPagamento>,
    @InjectRepository(Fatura)
    private faturasRepository: Repository<Fatura>,
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    private historicoService: HistoricoService,
  ) {
    this.mpClient = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN')!,
    });
  }

  async criarPagamento(criarPagamentoDto: CriarPagamentoDto): Promise<any> {
    try {
      const fatura = await this.faturasRepository.findOne({
        where: { id: criarPagamentoDto.faturaId },
        relations: ['cliente'],
      });

      if (!fatura) throw new BadRequestException('Fatura não encontrada.');
      if (fatura.paga) throw new BadRequestException('Fatura já está paga.');

      const prefrence = {
        items: [
          {
            id: String(fatura.id),
            title: `Fatura #${fatura.id} - ${fatura.cliente.nome}`,
            unit_price: Number(fatura.valor),
            quantity: 1,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: fatura.cliente.nome,
          email: fatura.cliente.email || 'cliente@exemplo.com',
        },
        external_reference: String(fatura.id),
        notification_url: `${this.configService.get('APP_URL')}/pagamentos/webhook`,
      };

      const preference = new Preference(this.mpClient);
      const response = await preference.create({ body: prefrence });

      const transacao = this.transacaoRepository.create({
        faturaId: fatura.id,
        clienteId: fatura.cliente.id,
        transacaoId: response.id,
        status: 'pending',
        valor: fatura.valor,
        urlPagamento: response.init_point,
        dadosPagamento: response,
      });

      await this.transacaoRepository.save(transacao);

      return {
        id: transacao.id,
        transacaoId: response.id,
        urlPagamento: response.init_point,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('Erro ao criar pagamento:', error);
      throw new BadRequestException('Erro ao criar pagamento.');
    }
  }

  async processarWebhook(
    webhookPagamentoDto: WebhookPagamentoDto,
  ): Promise<void> {
    try {
      if (webhookPagamentoDto.type !== 'payment') return;

      const paymentId = webhookPagamentoDto.data.id;

      const payment = new Payment(this.mpClient);
      const response = await payment.get({ id: paymentId });
      const paymentData = response;

      const transacao = await this.transacaoRepository.findOne({
        where: { transacaoId: paymentData.external_reference },
        relations: ['fatura', 'cliente'],
      });

      if (!transacao) {
        this.logger.error('Transação não encontrada');
        return;
      }

      transacao.status = paymentData.status ?? 'pending';
      transacao.dataAtualizacao = new Date();
      transacao.dadosPagamento = paymentData;

      if (paymentData.status === 'approved') {
        const fatura = transacao.fatura;
        fatura.paga = true;
        fatura.dataPagamento = new Date();
        await this.faturasRepository.save(fatura);

        transacao.dataPagamento = new Date();
      }

      await this.transacaoRepository.save(transacao);
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error);
    }
  }

  async verificarStatus(transacaoId: string): Promise<any> {
    const transacao = await this.transacaoRepository.findOne({
      where: { transacaoId },
      relations: ['fatura'],
    });

    if (!transacao) throw new BadRequestException('Transação não encontrada.');

    return {
      transacaoId: transacao.transacaoId,
      status: transacao.status,
      faturaId: transacao.fatura.id,
      valor: transacao.valor,
      urlPagamento: transacao.urlPagamento,
      dataCriacao: transacao.dataCriacao,
      dataPagamento: transacao.dataPagamento,
    };
  }
}
