import { Injectable } from '@nestjs/common';
import { FinanceiroService } from '../Financeiro/financeiro.service';
import { ClientesService } from '../clientes/clientes.service';
import { RadiusService } from '../Radius/radius.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BloqueioService {
    constructor(
        private financeiroService: FinanceiroService,
        private clientesService: ClientesService,
        private radiusService: RadiusService,
    ) {}

    
    @Cron(CronExpression.EVERY_DAY_AT_11PM)
    async verificarInadimplentes() {
        const clientes =  await this.clientesService.findAll();

        for(const cliente of clientes) {
            const temDebitos = await this.financeiroService.clienteTemFaturasAtrasadas(cliente.id);

            if (temDebitos && cliente.ativo) {
                await this.radiusService.bloquearCliente(cliente.login);
                await this.clientesService.update(cliente.id, { ativo: false})
            } 
            else if (!temDebitos && !cliente.ativo) {
                await this.radiusService.liberarCliente(cliente.login);
                await this.clientesService.update(cliente.id, { ativo: true });
            }
        }
               
    }

    async bloquearPorId(clienteId: number): Promise<void> {
        const cliente = await this.clientesService.findOne(clienteId);
        if (cliente && cliente.ativo) {
           await this.radiusService.bloquearCliente(cliente.login);
           await this.clientesService.update(clienteId, { ativo: false });
        }
    }
}