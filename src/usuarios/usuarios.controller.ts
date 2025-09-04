import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario-entitie';
import { NotFoundException } from '@nestjs/common';
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  listAll(): Promise<Usuario[]> {
    return this.usuarioService.listAll();
  }

  @Get(':id')
  async searchById(@Param('id') id: string): Promise<Usuario> {
    const user = await this.usuarioService.searchById(+id);

    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }

    return user;
  }
}
