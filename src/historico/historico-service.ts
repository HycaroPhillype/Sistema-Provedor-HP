import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricoCliente } from './entities/historico-entity';
@Injectable()
export class HistoricoService {
  private registros: any[] = [];

  registrar(acao: string, descricao: string, clienteId: number) {
    const registro = {
      acao,
      descricao,
      clienteId,
      data: new Date(),
    };
    this.registros.push(registro);
    console.log(`[HISTÓRICO] ${acao}: ${descricao}`);

    return registro;
  }

  obterRegistros(clienteId?: number): any[] {
    return this.registros;
  }
}
