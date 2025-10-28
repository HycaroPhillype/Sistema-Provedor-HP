import { Module } from '@nestjs/common';
import { HistoricoService } from './historico-service';
import { HistoricoCliente } from './entities/historico-entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HistoricoCliente])],
  providers: [HistoricoService],
  exports: [HistoricoService],
})
export class HistoricoModule {}
