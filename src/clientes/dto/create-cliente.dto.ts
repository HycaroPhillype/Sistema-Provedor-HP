import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  Length,
  IsOptional,
} from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 14)
  cpf: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsString()
  @IsNotEmpty()
  planoId: string;

  @IsString()
  @IsOptional()
  login: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  senha?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
