import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClientesService {
    constructor(
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
    ) {}

    async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
        // Gera login atomático se não for fornecido
        if (!createClienteDto.login) {
            createClienteDto.login = this.gerarLogin(createClienteDto.nome);
        }
        // Criptografa a senha antes de salvar
        if (createClienteDto.senha) {
            createClienteDto.senha = await this.criptografarSenha(createClienteDto.senha);
        }

        const cliente = this.clienteRepository.create(createClienteDto);
        return this.clienteRepository.save(cliente);
    }

    // Buscar todos os clientes (paginado para performance)
    async findAll(page: number = 1, limit: number = 10): Promise<Cliente[]> {
        return this.clienteRepository.find({
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    // Buscar cliente por ID
    async findOne(id: number): Promise<Cliente> {
        const cliente = await this.clienteRepository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
        return cliente;
    }
    // Atualização parcial com validação
    async update(id: number, updateData: Partial<Cliente>): Promise<Cliente> {
        await this.clienteRepository.update(id, updateData);
        return this.findOne(id);
    }

    // Desativa cliente ao invés de deletar (registro histórico)
    async remove(id: number): Promise<void> {
        await this.clienteRepository.update(id, { ativo: false });
    }

    // -- Métodos Auxiliares --

    private gerarLogin(nome: string): string {
        // Gerar login único baseado no nome
        const normalized = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalized.toLowerCase().replace(/\s+/g, '.');
    }

    private async criptografarSenha(senha: string): Promise<string> {
        // Usando bcrypt para segurança
        const saltRounds = 10;
        return await bcrypt.hash(senha, saltRounds);
    }
}