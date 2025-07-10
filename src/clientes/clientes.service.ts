import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import * as bcrypt from 'bcrypt';
import { RadiusService } from '../radius/radius-service';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private radiusService: RadiusService,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    if (!createClienteDto.login) {
      createClienteDto.login = this.gerarLogin(createClienteDto.nome);
    }

    if (!createClienteDto.senha) {
      throw new NotFoundException('Senha é obrigatória para criar um cliente');
    }

    if (createClienteDto.senha) {
      createClienteDto.senha = await this.criptografarSenha(
        createClienteDto.senha,
      );
    }

    const cliente = this.clienteRepository.create(createClienteDto);
    const clienteSave = await this.clienteRepository.save(cliente);

    await this.radiusService.addUser(
      clienteSave.login,
      createClienteDto.senha,
      clienteSave.ip_assinante,
    );

    return clienteSave;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Cliente[]> {
    return this.clienteRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return cliente;
  }
  async update(id: number, updateData: Partial<Cliente>): Promise<Cliente> {
    await this.clienteRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    const resultadoRadius = await this.radiusService.removeUser(cliente.login);
    if (!resultadoRadius) {
      this.logger.error(`Falha ao reomver ${cliente.login} do Radius`);
    }
    await this.clienteRepository.update(id, { ativo: false });

    this.logger.log(`Cliente ID ${id} (${cliente.nome}) marado como inativo.`);

    await this.historicoService.registrar(
      'CLIENTE_DESATIVADO',
      `CLIENTE ${cliente.nome} desativado.`,
    )
    
  }

  private gerarLogin(nome: string): string {
    const normalized = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.toLowerCase().replace(/\s+/g, '.');
  }

  private async criptografarSenha(senha: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(senha, saltRounds);
  }
}
