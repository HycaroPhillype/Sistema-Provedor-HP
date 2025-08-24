import { CreateClienteDto } from './create-cliente.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
