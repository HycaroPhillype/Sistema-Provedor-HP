import { Injectable } from '@nestjs/common';
import { FinanceiroService } from '../financeiro/financeiro-service';
import { ClientesService } from '../clientes/clientes.service';
import { RadiusService } from '../radius/radius-service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HistoricoService } from '../historico/historico-service';

@Injectable()
export class BloqueioService {
  constructor(
    private financeiroService: FinanceiroService,
    private clientesService: ClientesService,
    private radiusService: RadiusService,
    private historicoService: HistoricoService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async verificarInadimplentes() {
    this.logger.log('Iniciando verificação de clientes inadimplentes...');

    try {
      const clientes = await this.clientesService.findAll();

      for (const cliente of clientes) {
        try {
          const temDebitos =
            await this.financeiroService.clienteTemFaturasAtrasadas(cliente.id);

          if (temDebitos && cliente.ativo) {
            await this.radiusService.removeUser(cliente.login);

            await this.clientesService.update(cliente.id, { ativo: false });

            this.historicoService.registrar(
              'BLOQUEIO_AUTOMATICO',
              `Cliente bloqueado por inadimplência`,
              cliente.id,
            );

            this.logger.log(
              `Cliente ${cliente.nome} bloqueado por inadimplência`,
            );
          } else if (!temDebitos && !cliente.ativo) {
            await this.radiusService.addUser(cliente.login, cliente.senha);

            await this.clientesService.update(cliente.id, { ativo: true });

            this.historicoService.registrar(
              'DESBLOQUEIO_AUTOMATICO',
              `Cliente desbloqueado - débitos quitados`,
              cliente.id,
            );

            this.logger.log(`Cliente ${cliente.nome} desbloqueado`);
          }
        } catch (error) {
          this.logger.error(
            `Erro ao processar cliente ${cliente.nome}: ${error.message}`,
          );
        }
      }

      this.logger.log('Verificação de inadimplentes concluída');
    } catch (error) {
      this.logger.error(
        `Erro na verificação de inadimplentes: ${error.message}`,
      );
    }
  }

  async bloquearPorId(clienteId: number): Promise<void> {
    try {
      const cliente = await this.clientesService.findOne(clienteId);

      if (cliente && cliente.ativo) {
        await this.radiusService.removeUser(cliente.login);
        await this.clientesService.update(clienteId, { ativo: false });

        this.historicoService.registrar(
          'BLOQUEIO_MANUAL',
          `Cliente bloqueado manualmente`,
          cliente.id,
        );

        this.logger.log(`Cliente ${cliente.nome} bloqueado manualmente`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao bloquear cliente ${clienteId}: ${error.message}`,
      );
      throw error;
    }
  }

  async desbloquearPorId(clienteId: number): Promise<void> {
    try {
      const cliente = await this.clientesService.findOne(clienteId);

      if (cliente && !cliente.ativo) {
        await this.radiusService.addUser(cliente.login, cliente.senha);

        await this.clientesService.update(clienteId, { ativo: true });

        this.historicoService.registrar(
          'DESBLOQUEIO_MANUAL',
          `Cliente desbloqueado manualmente`,
          cliente.id,
        );

        this.logger.log(`Cliente ${cliente.nome} desbloqueado manualmente`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao desbloquear cliente ${clienteId}: ${error.message}`,
      );
      throw error;
    }
  }

  async verificarStatus(clienteId: number): Promise<any> {
    try {
      const cliente = await this.clientesService.findOne(clienteId);

      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      const temDebitos =
        await this.financeiroService.clienteTemFaturasAtrasadas(cliente.id);

      return {
        clienteId: cliente.id,
        nome: cliente.nome,
        ativo: cliente.ativo,
        temDebitos,
        podeSerDesbloqueado: !temDebitos && !cliente.ativo,
        podeSerBloqueado: temDebitos && cliente.ativo,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao verificar status do cliente ${clienteId}: ${error.message}`,
      );
      throw error;
    }
  }
}
