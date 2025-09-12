import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Fatura } from './entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Plano } from '../planos/entities/plano-entity';

@Injectable()
export class GeradorFaturasService {
  private readonly logger = new Logger(GeradorFaturasService.name);

  constructor(
    @InjectRepository(Fatura)
    private faturaRepository: Repository<Fatura>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Plano)
    private planoRepository: Repository<Plano>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async gerarFaturasMensais() {
    this.logger.log('Iniciando geração de faturas mensais...');

    try {
      const clientesAtivo = await this.clienteRepository.find({
        where: { ativo: true },
        relations: ['plano'],
      });

      this.logger.log(`Econtrados ${clientesAtivo.length} clientes ativos.`);

      let faturasGeradas = 0;

      for (const cliente of clientesAtivo) {
        try {
          const faturaFoiGerada = await this.gerarFaturaParaCliente(cliente);
          if (faturaFoiGerada) {
            faturasGeradas++;
          }
        } catch (error) {
          this.logger.error(
            `Erro ao gerar fatura para o cliente ${cliente.nome}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Geração de faturas concluída. Total de faturas geradas: ${faturasGeradas}`,
      );
    } catch (error) {
      this.logger.error(`Erro durante a geração de faturas: ${error.message}`);
    }
  }

  async gerarFaturaParaCliente(cliente: Cliente): Promise<boolean> {
    if (!cliente.plano) {
      this.logger.warn(
        `Cliente ${cliente.nome} não possui um plano associado. Pulando geração de fatura.`,
      );
      return false;
    }

    const primeiroDiaMes = new Date();
    primeiroDiaMes.setDate(1);
    primeiroDiaMes.setHours(0, 0, 0, 0);

    const ultimoDiaMew = new Date(primeiroDiaMes);
    ultimoDiaMew.setMonth(ultimoDiaMew.getMonth() + 1);
    ultimoDiaMew.setDate(0);

    const faturaExistente = await this.faturaRepository.findOne({
      where: {
        cliente: { id: cliente.id },
        dataVencimento: Between(primeiroDiaMes, ultimoDiaMew),
      },
    });

    if (faturaExistente) {
      this.logger.log(
        `Fatura já existe para o cliente ${cliente.nome} no mês atual. Pulando geração.`,
      );
      return false;
    }

    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 5);

    const newFatura = this.faturaRepository.create({
      clienteId: cliente.id,
      valor: cliente.planos.preco,
      dataVencimento: dataVencimento,
      paga: false,
      observacao: `FATURA MENSAL - ${cliente.planos.nome}`,
    });

    await this.faturaRepository.save(newFatura);
    this.logger.log(
      `FATURA GERADA PARA O CLIENTE ${cliente.nome}, VALOR: R$ ${cliente.planos.preco}`,
    );
    return true;
  }

  async executarGeracaoFatura(): Promise<string> {
    this.logger.log('EXECUTANDO FATURAS MANUALMENTE...');

    try {
      await this.gerarFaturasMensais();
      return 'GERAÇÃO DE FATURAS EXECUTADA COM SUCESSO!';
    } catch (error) {
      this.logger.error(`ERRO NA GERAÇÃO MANUAL: ${error.message}`);
      throw new Error(`FALHA AO GERAR FATURAS: ${error.message}`);
    }
  }
}
