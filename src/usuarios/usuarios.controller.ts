import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario-entitie';

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
  searchById(@Param('id') id: string): Promise<Usuario> {
    return this.usuarioService.searchById(id);
  }
}
