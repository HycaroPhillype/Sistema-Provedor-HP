import { Injectable } from '@nestjs/common';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { ClientesService } from '../clientes/clientes.service';
import { RadiusService } from '../radius/radius.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BloqueioService {
    constructor(
        private financeiroService: FinanceiroService,
        private clientesService: ClientesService,
        private radiusService: RadiusService,
    ) {}

    //Tarefa agendada: Executa diariamente as 23:00
    @Cron(CronExpression.EVERY_DAY_AT_11PM)
    async verificarInadimplentes() {
        const clientes =  await this.clientesService.findAll();

        for(const cliente of clientes) {
            const temDebitos = await this.financeiroService.clienteTemFaturasAtrasadas(cliente.id);

            if (temDebitos && cliente.ativo) {
                // Bloqueia o cliente com débito
                await this.radiusService.bloquearCliente(cliente.login);
                // Atualiza o status do cliente para inativo
                await this.clientesService.update(cliente.id, { ativo: false})
            } 
            else if (!temDebitos && !cliente.ativo) {
                // Libera cliente que regularizou débito
                await this.radiusService.liberarCliente(cliente.login);
                await this.clientesService.update(cliente.id, { ativo: true });
            }
        }
               
    }

    // Bloqueio manual ( via endpoint)
    async bloquearPorId(clienteId: number): Promise<void> {
        const cliente = await this.clientesService.findOne(clienteId);
        if (cliente && cliente.ativo) {
           await this.radiusService.bloquearCliente(cliente.login);
           await this.clientesService.update(clienteId, { ativo: false });
        }
    }
}