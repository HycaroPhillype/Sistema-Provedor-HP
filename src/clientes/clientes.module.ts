import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { RadiusModule } from '../radius/radius-module';
import { RadiusService } from '../radius/radius-service';
import { HistoricoModule } from '../historico/historico-module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    RadiusModule,
    HistoricoModule,
],
controllers: [ClientesController],
providers: [ClientesService,RadiusService],
exports: [ClientesService],
})
export class ClientesModule {}

