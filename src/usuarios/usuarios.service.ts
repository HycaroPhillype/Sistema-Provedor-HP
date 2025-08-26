import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario-entitie';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const userExists = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });

    if (userExists) {
      throw new Error('Usuário com este email já existe');
    }

    const user = this.usuarioRepository.create(createUsuarioDto);
    return this.usuarioRepository.save(user);
  }

  async searchByEmail(email: string): Promise<Usuario> {
    const user = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async listAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }
}
