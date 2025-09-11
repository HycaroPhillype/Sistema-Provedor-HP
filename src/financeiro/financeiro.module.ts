import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroService } from './financeiro-service';
import { FinanceiroController } from './financeiro.controller';
import { Fatura } from './entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClientesModule } from '../clientes/clientes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fatura, Cliente]), ClientesModule],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}
