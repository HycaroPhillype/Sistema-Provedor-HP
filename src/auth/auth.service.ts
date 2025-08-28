import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usuarioService.searchByEmail(loginDto.email);
    const passwordValid = await bcrypt.compare(loginDto.senha, user.senha);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      nome: user.nome,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: 3600,
    };
  }

  async validateUser(email: string): Promise<any> {
    const user = await this.usuarioService.searchByEmail(email);

    if (user && (await bcrypt.compare(user.senha, user.senha))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { senha, ...result } = user;
      return result;
    }

    return null;
  }
}
