import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Documentação
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 201, description: 'Todos clientes listados.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.clientesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado.' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
  findOne(@Param('id') id: number) {
    return this.clientesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso.' })
  async update(@Param('id') id: string, @Body() updateData: UpdateClienteDto) {
    return this.clientesService.update(+id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar cliente' })
  @ApiResponse({ status: 204, description: 'Cliente desativado com sucesso.' })
  async remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}
