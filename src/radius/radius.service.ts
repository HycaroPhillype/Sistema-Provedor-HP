import { Injectable } from '@nestjs/common';
import * as radius from 'radius';

interface RadiusClient {
    disableUser(userId: string): Promise<void>;
    enableUser(userId: string): Promise<void>;
}

@Injectable()
export class RadiusService {
  private readonly radiusClient: RadiusClient;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.radiusClient = new (radius as any).Client({
        host: 'ip-do-roteador',
        secret: 'senha-secreta-radius',
        port: 1812,
    }) as unknown as RadiusClient;
  }

  async bloquerCliente(clienteId: number) {
    await this.radiusClient.disableUser(clienteId.toString());
  }

  async liberarCliente(clienteId: number) {
    await this.radiusClient.enableUser(clienteId.toString());
  }
}   