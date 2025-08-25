import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreatePlanoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  velocidadeDownload: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  velocidadeUpload: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  preco: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  duracaoDias?: string;
}
