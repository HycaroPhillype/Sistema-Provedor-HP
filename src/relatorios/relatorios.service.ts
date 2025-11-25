import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fatura } from '../financeiro/entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Plano } from '../planos/entities/plano-entity';
import { TransacaoPagamento } from '../pagamentos/entities/transacao-pagamento.entiity';
import { FiltroRelatoriosDto, TipoRelatorio } from './dto/filtro-relatorios.dto';
import { parse } from 'path';

@Injectable()
export class RelatoriosService {
  private readonly logger = new Logger(RelatoriosService.name);

  constructor(
    @InjectRepository(Fatura)
    private readonly faturaRepository: Repository<Fatura>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Plano)
    private readonly planoRepository: Repository<Plano>,
    @InjectRepository(TransacaoPagamento)
    private readonly transacaoPagamentoRepository: Repository<TransacaoPagamento>,
  ) {}

  async gerarRelatorio(filtro: FiltroRelatoriosDto): Promise<any> {
    this.logger.log(`Gerando relatório: ${filtro.tipoRelatorio}`);

    swithch (filtro.tipo) {
        case TipoRelatorio.RESUMO_MENSAL:
            return await this.relatorioResumoMensal(filtro);

            case TipoRelatorio.CLIENTE_INADIMPLENTE:
            return await this.relatorioClienteInadimplente(filtro);

            case TipoRelatorio.RECEITAS_PLANOS:
            return await this.relatorioReceitasPlanos(filtro);

            case TipoRelatorio.HISTORICO_PAGAMENTOS:
            return await this.relatorioHistoricoPagamentos(filtro);

            default:
                throw new Error("Tipo de relatório não suportado");
    }
  }

  private async relatorioResumoMensal(filtro: FiltroRelatoriosDto) {
    const { dataInicio, dataFim } = this.processarDatas(filtro);

    const receitas = await this.faturaRepository
        .createQueryBuilder('fatura')
        .select('SUM(fatura.valor)', 'total')
        .where('fatura.paga = :paga', { paga: true})
        .andWhere('fatura.dataPagamento BETWEEN :inicio AND :fim', {
            inicio? dataInicio,
            fim: dataFim,
        })
        .getRawOne();

        const pendentes = await this.faturaRepository
        .createQueryBuilder('fatura')
        .select('SUM(fatura.valor)', 'total')
        .where('fatura.paga = :paga', { paga: false})
        .andWhere('fatura.dataVencimento BETWEEN :inicio AND :fim', {
            inicio: dataInicio,
            fim: dataFim,
        })
        .getRawOne();

        const clientesAtivos = await this.clienteRepository.count({
            where: { ativo: true},
        });

        const hoje = new Date();
        const clientesInadiplentes = await this.clienteRepository
        .createQueryBuilder('cliente')
        .leftJoin('cliente.faturas', 'fatura')
        .where('fatura.paga = :paga', { paga: false})
        .andWhere('fatura.dataVencimento < :hoje', { hoje })
        .andWhere('cliente.ativo = :ativo', { ativo: true})
        .getCount();

        return {
            tipo: 'resumo_mensal',
            periodo: {
                inicio: dataInicio,
                fim: dataFim,
            },
            metricas: {
                receitas: parseFloat(receitas.total) || 0,
                pendentes: parseFloat(pendentes.total) || 0,
                clientesAtivos,
                clientesInadiplentes,
                taxaInadimplencia: clientesAtivos > 0
                    ? (clientesInadiplentes / clientesAtivos) * 100
                    : 0,
            },
            resumo: {
                receitaLiquida: (parseFloat(receitas.total) || 0) - (parseFloat(pendentes.total) || 0),

                eficienciaCobranca: receitas.total > 0 ? ((parseFloat(receitas.total) || 0) / ((parseFloat(receitas.total) || 0) + (parseFloat(pendentes.total) || 0))) * 100 : 0,
            },
            
        };
  }

  private async relatorioClientesInadimplentes(filtro: FiltroRelatoriosDto) {
    const hoje = new Date();

    const clientesInadimplentes = await this.clienteRepository
        .createQueryBuilder('cliente')
        .leftJoinAndSelect('cliente.faturas', 'fatura')
        .leftJoinAndSelect('cliente.plano', 'plano')
        .where('fatura.paga = :paga', { paga: false})
        .andWhere('fatura.dataVencimento < :hoje', { hoje })
        .andWhere('cliente.ativo = :ativo', { ativo: true})
        .getMany();

        const clientesDetalhados = clientesInadimplentes.map(cliente => {
            const faturasPendentes = cliente.faturas.filter(fatura => !fatura.paga && fatura.dataVencimento < hoje);
        
            const totalDevido = faturasPendentes.reduce(
                (acc, fatura) => acc + parseFloat(fatura.valor.toString()),
                0,
            );

            const diasAtraso = faturasPendentes.legth > 0 ? Math.floor((hoje.getTime() - faturasPendentes[0].dataVencimento.getTime()) / (1000 * 60 * 60 * 24)) : 0;

            return {
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email,
                plano: cliente.plano?.nome,
                totalFaturasPendentes: faturasPendentes.length,
                totalDevido,
                diasAtraso,
                ultimaFatura: faturasPendentes.length > 0 ? {
                    valor: faturasPendentes[0].valor,
                    vencimento: faturasPendentes[0].dataVencimento,
                } : null,
            };
        });

        clientesDetalhados.sort((a, b) => b.totalDevido - a.totalDevido);
        
        return {
            tipo: 'cliente_inadimplente',
            totalClientes: clientesDetalhados.lengtg,
            totalDevido: clientesDetalhados.reduce((acc, cliente) => acc + cliente.totalDevido, 0),
            clientes: clientesDetalhados,
            metricas: {
                maiorDivida: clientesDetalhados.length > 0 ? Math.max(...clientesDetalhados.map(c => c.totalDevido)) : 0,
                mediaDivida: clientesDetalhados.length > 0 ? clientesDetalhados.reduce((acc, c) => acc + c.totalDevido, 0) / clientesDetalhados.length : 0,
            },

        };
    }

    private async relatorioReceitasPlanos(filtro: FiltroRelatoriosDto) {
        const {
            dataInicio, dataFim
        } = this.processarDatas(filtro);

        const receitasPorPlano = await this.faturaRepository
        .createQueryBuilder('plano')
        .leftJoin('plano.cliente', 'cliente')
        .leftJoin('cliente.faturas', 'fatura')
        .select('plano.nome', 'plano')
        .addSelect('plano.preco', 'preco')
        .addSelect('COUNT(fatura.id)', 'totalFaturas')
        .addSelect('COUNT(DISTINCT cliente.id)', 'totalClientes')
        .addSelecet('SUM(CASE WHEN fatura.paga = true THEN fatura.valor ELSE 0 END)', 'receita')
        .where('fatura.dataVencimento BETWEEN :inicio AND :fim', {
            inicio: dataInicio,
            fim: dataFim,
        })
        .groupBy('plano.id','plano.nome','plano.preco')
        .getRawMany();

        const totalReceita = receitasPorPlano.reduce(
            (acc, plano) => acc + parseFloat(plano.receita || 0),
            0,
        );

        return {
            tipo: 'receitas_planos',
            periodo: {
                inicio: dataInicio,
                fim: dataFim,
            },
            planos: receitasPorPlano.map(plano => ({
                nome: plano.plano,
                preco: parseFloat(plano.preco),
                totalClientes: parseInt(plano.totalClientes),
                totalFaturas: parseInt(plano.totalFaturas),
                receitas: parseFloat(plano.receita || 0),
                participacao: totalReceita > 0 ? (parseFloat(plano.receita || 0) / totalReceita) * 100 : 0,
            })),
            total: {
                reiceitaTotal: totalReceita,
                clientesTotal: receitasPorPlano.reduce((acc, plano) => acc + parseInt(plano.totalClientes), 0),

            }
        };
    }

    private async relatorioHistoricoPagamentos(filtro: FiltroRelatoriosDto) {
        const { dataInicio, dataFim } = this.processarDatas(filtro);

        const pagamentos = await this.transacaoPagamentoRepository
            .createQueryBuilder('transacao')
            .leftJoinAndSelect('transacao.fatura', 'fatura')
            .leftJoinAndSelect('fatura.cliente', 'cliente')
            .where('transacao.dataPagamento BETWEEN :inicio AND :fim', {
                inicio: dataInicio,
                fim: dataFim,
            })
            .andWhere('transaca.status = :status', { status: 'concluido'});
            .orderBy('transacao.dataPagamento', 'DESC')
            .getMany();
        
        const pagamentosPorDia = pagamentos.reduce((acc, pagamento) => {
            const data = pagamento.dataPagamento.toISOString().split('T')[0];

            if (!acc[data]) {
                acc[data] = {
                    data,
                    total: 0,
                    quantidade: 0,
                };
            }
            
            acc[data].total += parseFloat(pagamento.valor.toString());
            acc[data].quantidade += 1;

            return acc;
        }, {});

        return {
            tipo: 'historico_pagamentos',
            periodo: {
                inicio: dataInicio,
                fim: dataFim,
            },
            resumo: {
                totalPagamentos: pagamentos.length,
                valorTotal: pagamentos.reduce((acc, p) => acc + parseFloat(p.valor.toString()), 0) / pagamentos.length : 0,
            },
            pagamentos: pagamentos.map(pagamento => ({
                id: pagamento.id,
                cliente: pagamento.cliente.nome,
                dataPagamento: pagamento.dataPagamento,
                metodo: 'Mercado Pago',
                faturaId: pagamento.fatura.id,
            })),
            evolucaoDiaria: Object.values(pagamentosPorDia),
        };

    }

    private processarDatas(filtro: FiltroRelatoriosDto): { dataInicio: Date; dataFim: Date } {
        let dataInicio: Date;
        let dataFim: Date;

        if (filtro.dataInicio && filtro.dataFim) {
            dataInicio = new Date(filtro.dataInicio);
            dataFim = new Date(filtro.dataFim);
        } else {
            const hoje = new Date();
            dataInicio = new Date(hoje.getFullYear(), hoje.getMoth(), 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        }

        dataInicio.setHours(0,0,0,0);
        dataFim.setHours(23,59,59,999);

        return { dataInicio, dataFim };
    }

    async dashboard(): Promise<any> {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        const recetaMes = await this.faturaRepository
        
            
            .getRawOne();

        const clientesAtivos = await this.clienteRepository.count({
            where: { ativo: true},
        });

        const seteDias = new Date();
        seteDias.setDate(hoje.getDate() + 7);

        const proximoVencimento = await this.faturaRepository
        .createQueryBuilder('fatura')
        .leftJoinAndSelect('fatura.valor', 'total')
        .where('fatura.paga = :paga', { paga: false})
        .andWhere('fatura.dataVencimento BETWEEN :hoje AND :seteDias', {
            hoje,
            seteDias,
        })
        .getRawOne();

        return {
            receitaMes: parseFloat(receitaMes.total) ?? 0,
            clientesAtivos,
            faturasPendentes,
            proximosVencimentos: parseFloat(proximoVencimento?.total) || 0,
            atualizadoEm: new Date(),
        };
    }
        
    
           
}

    

