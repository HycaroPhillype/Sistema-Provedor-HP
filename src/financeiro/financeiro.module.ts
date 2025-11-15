import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroService } from './financeiro-service';
import { GeradorFaturasService } from './gerador-faturas.service';
import { FinanceiroController } from './financeiro.controller';
import { Fatura } from './entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClientesModule } from '../clientes/clientes.module';
import { Plano } from '../planos/entities/plano-entity';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fatura, Cliente, Plano]),
    ClientesModule,
    NotificacoesModule,
  ],
  controllers: [FinanceiroController],
  providers: [FinanceiroService, GeradorFaturasService],
  exports: [FinanceiroService, GeradorFaturasService],
})
export class FinanceiroModule {}
