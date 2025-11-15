import { Module } from '@nestjs/common';
import { BloqueioService } from './bloqueio-service';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { ClientesModule } from '../clientes/clientes.module';
import { RadiusModule } from '../radius/radius-module';
import { HistoricoModule } from '../historico/historico-module';

@Module({
  imports: [FinanceiroModule, ClientesModule, RadiusModule, HistoricoModule],
  providers: [BloqueioService],
  exports: [BloqueioService],
})
export class BloqueioModule {}
