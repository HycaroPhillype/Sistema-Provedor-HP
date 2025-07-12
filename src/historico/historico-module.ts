import { Module } from '@nestjs/common';
import { HistoricoService } from './historico-service';

@Module({
  providers: [HistoricoService],
  exports: [HistoricoService],
})
export class HistoricoModule {}
