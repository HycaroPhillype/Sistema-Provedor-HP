import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacoesService } from './notificacoes.service';
import { Fatura } from '../financeiro/entities/fatura-entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { HistoricoModule } from '../historico/historico-module';

@Module({
  imports: [TypeOrmModule.forFeature([Fatura, Cliente]), HistoricoModule],
  providers: [NotificacoesService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
