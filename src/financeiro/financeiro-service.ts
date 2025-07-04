import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Not, Repository } from 'typeorm';
import { Fatura } from 'src/financeiro/fatura-entity';
import { ClientesService } from '../clientes/clientes.service';
import { count } from 'console';

@Injectable()
export class FinanceiroService {
    constructor(
        @InjectRepository(Fatura)
        private faturaRepository: Repository<Fatura>,
        private clientesService: ClientesService,
    ) {}

    async clienteTemFaturasAtrasadas(clienteId: number): Promise<boolean> {
        const cliente = await this.clientesService.findOne(clienteId);

        if (!cliente) {
            throw new NotFoundException(`Cliente com ID ${clienteId} não encontrado`);
        }

        const hoje =  new Date();

        const conte = await this.faturaRepository.count({
            where: {
                clientes: { id: clienteId },
                paga: false,
                vencimento: LessThan(hoje),
            }
        });

        return conte > 0;
    
    }
}