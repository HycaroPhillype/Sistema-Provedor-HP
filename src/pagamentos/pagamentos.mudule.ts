import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagamentosService } from './pagamentos.service';
import { PagamentosController } from './pagamentos.controller';
import { TransacaoPagamento } from './entities/transacao-pagamento.entiity';
import { Fatura } from '../financeiro/entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { HistoricoModule } from '../historico/historico-module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransacaoPagamento, Fatura, Cliente]),
    HistoricoModule,
  ],
  controllers: [PagamentosController],
  providers: [PagamentosService],
  exports: [PagamentosService],
})
export class PagamentosModule {}
