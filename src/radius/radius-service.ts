import { Injectable, Logger } from '@nestjs/common';
import RadiusClient from 'node-radius-client';

@Injectable()
export class RadiusService {
  private readonly logger = new Logger(RadiusService.name);
  private readonly client: any;
  private readonly radiusSecret: string;

  constructor() {
    this.client = new RadiusClient({
      host: process.env.RADIUS_SERVER || '192.168.1.1',
      retries: 3, 
      timeout: 5000,
    });

    this.radiusSecret = process.env.RADIUS_SECRET || 'testing123';

    this.logger.log(
      `Serviço RADIUS configurado para o host: ${this.client.options.host}`,
    );
  }

  async bloquearCliente(username: string): Promise<boolean> {
    this.logger.warn(`Método bloquearCliente ainda não implementado.`);
    return false;
  }

  async liberarCliente(username: string): Promise<boolean> {
    this.logger.warn(`Método liberarCliente ainda não implementado.`);
    return false;
  }

  async verificarStatus(
    username: string,
  ): Promise<'Ativo' | 'Inativo' | 'Erro'> {
    try {
      const status = await this.client.checkUserStatus(username);
      return status === 'Active' ? 'Ativo' : 'Inativo';
    } catch (error) {
      this.logger.error(
        `Erro ao verificar status do usuário ${username}`,
        error.stack,
      );
      return 'Erro';
    }
  }

  async addUser(
    username: string,
    password: string,
    ip_Assinante?: string,
  ): Promise<boolean> {
    try {
      const attributes = [['Service-Type', 'Framed-User']];
      if (ip_Assinante) {
        attributes.push(['Framed-IP-Address', ip_Assinante]);
      }

      await this.client.addUser({
        username,
        password,
        attributes,
      });

      this.logger.log(`Usuário ${username} adicionado/atualizado no RADIUS.`);
      return true;
    } catch (error) {
      this.logger.error(
        `Erro ao adicionar/atualizar usuário ${username} no RADIUS`,
        error.stack,
      );
      return false;
    }
  }

  async autenticarUsuario(
    username: string,
    password: string,
  ): Promise<boolean> {
    try {
      const result = await this.client.authenticate({ username, password });
      return result;
    } catch (error) {
      this.logger.error(`Erro ao autenticar usuário ${username}`, error.stack);
      return false;
    }
  }
}
