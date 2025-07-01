// src/radius/radius.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as radius from 'radius'; // Biblioteca para comunicação RADIUS
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class RadiusService {
  private readonly logger = new Logger(RadiusService.name);  // Logger para depuração
  private readonly client: radius.Client;  // Cliente RADIUS

  constructor() {
    // Configuração do cliente RADIUS
    this.client = new radius.Client({
      host: process.env.RADIUS_SERVER,  // IP do servidor (ex: '192.168.1.1')
      secret: process.env.RADIUS_SECRET, // Senha compartilhada
      port: 1812,                       // Porta padrão RADIUS
      timeout: 5000                     // Tempo limite em milissegundos
    });
    
    this.logger.log('Serviço RADIUS inicializado');  // Log de inicialização
  }

  // Adiciona/Atualiza usuário no RADIUS
  async adicionarUsuario(cliente: Cliente): Promise<boolean> {
    try {
      await this.client.addUser({
        username: cliente.login,  // Nome de usuário PPPoE
        password: cliente.senha,  // Senha PPPoE
        attributes: [             // Atributos adicionais
          ['Framed-IP-Address', cliente.ip_assinante || '10.0.0.1'],
          ['Service-Type', 'Framed-User']  // Tipo de serviço
        ]
      });
      return true;
    } catch (error) {
      this.logger.error(`Falha ao adicionar usuário ${cliente.login}`, error.stack);
      return false;
    }
  }

  // Bloqueia acesso do cliente
  async bloquearCliente(clienteId: string): Promise<boolean> {
    try {
      await this.client.disableUser(clienteId);  // Desativa usuário no RADIUS
      return true;
    } catch (error) {
      this.logger.error(`Falha ao bloquear cliente ${clienteId}`, error.stack);
      return false;
    }
  }

  // Libera acesso do cliente
  async liberarCliente(clienteId: string): Promise<boolean> {
    try {
      await this.client.enableUser(clienteId);  // Reativa usuário no RADIUS
      return true;
    } catch (error) {
      this.logger.error(`Falha ao liberar cliente ${clienteId}`, error.stack);
      return false;
    }
  }

  // Verifica status da conexão
  async verificarConexao(clienteId: string): Promise<boolean> {
    try {
      const status = await this.client.checkUserStatus(clienteId);
      return status === 'Active';  // Retorna true se usuário está ativo
    } catch (error) {
      this.logger.error(`Falha ao verificar status de ${clienteId}`, error.stack);
      return false;
    }
  }
}