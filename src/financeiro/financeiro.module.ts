import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroController } from './financeiro.controller';
import { Fatura } from './entities/fatura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fatura])],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}
