// src/radius/radius.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as radius from 'radius'; // Biblioteca para comunicação RADIUS
import { Cliente } from '../clientes/entities/cliente-entity';
import { time } from 'console';
import { asyncWrapProviders } from 'async_hooks';

@Injectable()
    export class RadiusService {
      private readonly logger = new Logger(RadiusService.name);
      private readonly client = radius.Client;

      constructor() {
        this.client = new radius.Client({
          host: process.env.RADIUS_SERVER || '192.168.1.1',
          secret: process.env.RADIUS_SECRET || 'testing123',
          port: 1812,
          timeout: 5000,
        });

        this.logger.log(`Servico RADIUS configurado para o host? ${this.client.options.host}`);

      }
      async bloquearCliente(username: string): Promise<boolean> {
        try {
          await this.client.disableUser(username);
          this.logger.log(`Usuário ${username} bloqueado com sucesso.`);
          return true;

        } catch (error) {
          this.logger.error(`Falha ao bloquear o usuário ${username}`, error.stack);
          return false;
          
      }

    }

    async liberarCliente(username: string): Promise<boolean> {
      try {
        await this.client.enableUser(username);

        this.logger.log(`Usuário ${username} liberado com sucesso.`);
        return true;

      } catch (error) {
        this.logger.error(`Falha ao liberar o usuário ${username}`, error.stack);
        return false;
      }
    }

    async verificarStatus(username: string): Promise<'Ativo' | 'Inativo' | 'Erro'> {
      try {
        const status = await this.client.checkUserStatus(username);

        if (status === 'Active') {
          return 'Ativo';
        } else {
          return 'Inativo';
        }
      } catch (error) {
        this.logger.error(`Erro ao verificar status do usuário ${username}`, error.stack);
        return 'Erro';
      }

    }

    async adicionarUsuario(username: string, password: string, ipAssinante?: string): Promise<boolean> {
      try {
        const attributes = [
          ['Service-Type', 'Framed-User'],
        ];

        if (ipAssinante) {
          attributes.push(['Framed-IP-Address', ipAssinante]);
        }

        await this.client.addUser({
          username, 
          password, 
          attributes
        });

        this.logger.log(`Usuário ${username} adicionado/atualizado no RADIUS.`);
        return true;
      } catch (error) {
        this.logger.error(`Erro ao adicionar/atualizar usuário ${username} no RADIUS`, error.stack);
        return false;
      }

    }

    async autenticarUsuario(username: string, password: string): Promise<boolean> {
      try {
        const result = await this.client.authenticate({username, password});
        return result;
      } catch (error) {
        this.logger.error(`Erro ao autenticar usuário ${username}`, error.stack);
        return false;
      }
    }
  }