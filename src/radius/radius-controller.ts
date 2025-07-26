import { Controller, Post, Body, Get } from '@nestjs/common';
import { RadiusService } from './radius-service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

class RadiusTestDto {
  username: string;
  password: string;
  ip?: string;
}

@ApiTags('Radius - Testes e Operações')
@Controller('radius')
export class RadiusController {
  constructor(private readonly radiusService: RadiusService) {}

  @Post('bloquear')
  @ApiOperation({ summary: 'Bloquear um usuário no Radius' })
  @ApiResponse({ status: 200, description: 'Usuário bloqueado com sucesso.' })
  async bloquearUsuario(@Body() body: RadiusTestDto) {
    return {
      success: await this.radiusService.bloquearCliente(body.username),
      username: body.username,
    };
  }

  @Post('adicionar')
  @ApiOperation({ summary: 'Adicionar/atualiza um usuário no Radius' })
  @ApiResponse({ status: 200, description: 'Usuário configurado com sucesso.' })
  async addUser(@Body() body: RadiusTestDto) {
    return {
      success: await this.radiusService.addUser(
        body.username,
        body.password,
        body.ip,
      ),
      username: body.username,
    };
  }

  @Get('autenticar')
  @ApiOperation({ summary: 'Testar autenticação de usuário no Radius' })
  @ApiResponse({ status: 200, description: 'Usuário autenticado com sucesso.' })
  async testarAutenticacao(@Body() body: RadiusTestDto) {
    if (!body.password) {
      return {
        success: false,
        message: 'Senha é obrigatória para autenticação.',
      };
    }
    return {
      autenticado: await this.radiusService.autenticarUsuario(
        body.username,
        body.password,
      ),
      username: body.username,
    };
  }
}
