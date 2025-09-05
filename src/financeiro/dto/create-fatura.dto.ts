import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFaturaDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  clienteId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  valor: number;

  @IsNotEmpty()
  @IsDateString()
  dataVencimento: string;

  @IsNotEmpty()
  @IsBoolean()
  pago?: boolean;

  @IsOptional()
  @IsString()
  observacao?: string;
}
