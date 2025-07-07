import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { RadiusModule } from '../radius/radius-module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente]),
    RadiusModule
],
controllers: [ClientesController],
providers: [ClientesService],
exports: [ClientesService],
})
export class ClientesModule {}

