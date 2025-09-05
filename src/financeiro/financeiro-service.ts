import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { Fatura } from 'src/financeiro/entities/fatura-entity';
import { ClientesService } from '../clientes/clientes.service';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Fatura)
    private faturaRepository: Repository<Fatura>,
    private clientesService: ClientesService,
  ) {}

  async createFatura(createFatiraDto: CreateFaturaDto): Promise<Fatura> {
    const fatura = this.faturaRepository.create(createFatiraDto);
    return this.faturaRepository.save(fatura);
  }

  async searchAllFaturas(): Promise<Fatura[]> {
    return this.faturaRepository.find({
      relations: ['cliente'],
      order: { dataVencimento: 'DESC' },
    });
  }

  async searchFaturasByCliente(clienteId: number): Promise<Fatura[]> {
    return this.faturaRepository.find({
      where: { clienteId },
      relations: ['cliente'],
      order: { dataVencimento: 'DESC' },
    });
  }

  async searchFaturaById(id: number): Promise<Fatura> {
    const fatura = await this.faturaRepository.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!fatura) {
      throw new NotFoundException(`Fatura com ID ${id} não encontrada`);
    }
    return fatura;
  }

  async updateFatura(
    id: number,
    updateFaturaDto: UpdateFaturaDto,
  ): Promise<Fatura> {
    const fatura = await this.searchFaturaById(id);
    Object.assign(fatura, updateFaturaDto);

    if (updateFaturaDto.pago && !fatura.dataPagamento) {
      fatura.dataPagamento = new Date();
    }

    return this.faturaRepository.save(fatura);
  }

  async removeFatura(id: number): Promise<void> {
    const fatura = await this.searchFaturaById(id);

    await this.faturaRepository.remove(fatura);
  }

  async searchFaturasByPeriod(inicio: Date, fim: Date): Promise<Fatura[]> {
    return this.faturaRepository.find({
      where: {
        dataVencimento: Between(inicio, fim),
      },
      relations: ['cliente'],
      order: { dataVencimento: 'ASC' },
    });
  }

  async searchDefaulters(): Promise<any[]> {
    const query = `
      SELECT c.*
      FROM clientes c
      INNER JOIN faturas f ON c.id = f.cliente_id
      WHERE f.paga = false AND f.data_vencimento < CURENT _DATA
      `;

    return this.faturaRepository.query(query);
  }

  generateFaturasMensais(): void {
    console.log('Gerando faturas mensais...');
    return;
  }

  async clienteTemFaturasAtrasadas(clienteId: number): Promise<boolean> {
    const cliente = await this.clientesService.findOne(clienteId);

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${clienteId} não encontrado`);
    }

    const hoje = new Date();

    const conte = await this.faturaRepository.count({
      where: {
        cliente: { id: clienteId },
        paga: false,
        dataVencimento: LessThan(hoje),
      },
    });

    return conte > 0;
  }
}
