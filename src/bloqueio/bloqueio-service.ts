import { Injectable } from '@nestjs/common';

@Injectable()
export class BloqueioService {
    constructor(
        private financeiroService: FinanceiroService,
        private radiusService: RadiusService,
    ) {}
    async verificarInadimplentes() {
        const faturasAtrasadas = await this.financeiroService.getFaturaAtrasadas();

        for (const fatura of faturasAtrasadas) {
            await this.radiusService.bloquearCliente(fatura.cliente.id);
            fatura.cliente.ativo = false;
            await fatura.cliente.save();
        }
    }
}