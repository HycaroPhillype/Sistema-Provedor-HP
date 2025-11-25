
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
import { Fatura } from '../financeiro/entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Plano } from '../planos/entities/plano-entity';
import { TransacaoPagamento } from '../pagamentos/entities/transacao-pagamento.entiity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fatura, Cliente, Plano, TransacaoPagamento]),
  ],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
  exports: [RelatoriosService],
})
export class RelatoriosModule {}