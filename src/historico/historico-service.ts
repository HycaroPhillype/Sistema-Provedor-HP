import { Injectable } from '@nestjs/common';

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
