import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { Fatura } from '../financeiro/entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { HistoricoService } from '../historico/historico-service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificacoesService {
  private readonly logger = new Logger(NotificacoesService.name);
  faturaRepoisitory: any;

  constructor(
    @InjectRepository(Fatura)
    private readonly faturaRepository: Repository<Fatura>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    private readonly historicoService: HistoricoService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async verificarFaturasProximasVencimento() {
    this.logger.log(
      'Iniciando verificação de faturas próximas ao vencimento...',
    );
    try {
      const hoje = new Date();

      const tresDiasDepois = new Date();
      tresDiasDepois.setDate(hoje.getDate() + 3);

      const faturasProximas = await this.faturaRepository.find({
        where: {
          dataVencimento: Between(hoje, tresDiasDepois),
          paga: false,
        },
        relations: ['cliente'],
      });

      this.logger.log(
        `Encontradas ${faturasProximas.length} faturas próximas ao vencimento.`,
      );

      let notificacoesEnviadas = 0;
      for (const fatura of faturasProximas) {
        try {
          const notificacaoEnviada = await this.enviarNotificacao(fatura);
          if (notificacaoEnviada) {
            notificacoesEnviadas++;
          }
        } catch (error) {
          this.logger.error(
            `Erro ao enviar notificação para a fatura ID ${fatura.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Notificações enviadas com sucesso: ${notificacoesEnviadas}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao verificar faturas próximas ao vencimento: ${error.message}`,
      );
    }
  }

  async enviarNotificacao(fatura: Fatura): Promise<boolean> {
    try {
      const mensagem = `Lembrete: Sua fatura de R$${fatura.valor} vence em ${fatura.dataVencimento.toLocaleDateString()}. Por favor, efetue o pagamento para evitar interrupções no serviço.`;

      this.logger.log(
        `Enviando notificação para o cliente ${fatura.cliente.nome} (${fatura.cliente.email}): ${mensagem}`,
      );

      await this.historicoService.registrar(
        fatura.clienteId,
        'NOTIFICACAO_VENCIMENTO',
        mensagem,
      );

      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação: ${error.message}`);
      return false;
    }
  }

  async verificarFaturasVencidas(): Promise<void> {
    this.logger.log('Iniciando verificação de faturas vencidas...');
    try {
      const hoje = new Date();

      const faturasVencidas = await this.faturaRepository.find({
        where: {
          dataVencimento: LessThanOrEqual(hoje),
          paga: false,
        },
        relations: ['cliente'],
      });

      this.logger.log(`Encontradas ${faturasVencidas.length} faturas vencidas.`);

      let notificacoesEnviadas = 0;
      for (const fatura of faturasVencidas) {
        try {
          const notificacaoEnviada = await this.enviarNotificacao(fatura);
          if (notificacaoEnviada) {
            notificacoesEnviadas++;
          }
        } catch (error) {
          this.logger.error(
            `Erro ao enviar notificação para a fatura ID ${fatura.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Notificações de faturas vencidas enviadas com sucesso: ${notificacoesEnviadas} notificações enviadas.`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao verificar faturas vencidas: ${error.message}`,
      );

    }
  }

    async enviarNotificacaoAtraso(fatura: Fatura): Promise<boolean> {
      try {
        const hoje = new Date();
        const diasAtraso = Math.floor(
          (hoje.getTime() - fatura.dataVencimento.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        const mensagem = `Aviso: Sua fatura de R$${fatura.valor} está vencida há ${diasAtraso} dias. Por favor, regularize seu pagamento o mais rápido possível para evitar cobranças adicionais.`;

        this.logger.log(
          `Enviando notificação de fatura vencida para o cliente ${fatura.cliente.nome} (${fatura.cliente.email}): ${mensagem}`,
        );

        await this.historicoService.registrar(
          fatura.clienteId,
          `NOTIFICACAO_FATURA_VENCIDA`,
          mensagem,
        );

        return true;
      } catch (error) {
        this.logger.error(`Erro ao enviar notificação: ${error.message}`);
        return false;
      }
    }

    async executarVerificacoesManuais(): Promise<string> {
      this.logger.log('Executando verificações manuais de faturas...');
      try {
      await this.verificarFaturasProximasVencimento();
      await this.verificarFaturasVencidas();
      return 'Verificações manuais concluídas.';
    } catch (error) {
      this.logger.error(
        `Erro ao executar verificações manuais: ${error.message}`,
      throw new Error(`Falha ao verificar notificações: ${error.message}`
      );
      
    }
  }
}
