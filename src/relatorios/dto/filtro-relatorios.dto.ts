import { IsOptional, IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';

export enum TipoRelatorio {
  RESUMO_MENSAL = 'resumo_mensal',
  CLIENTE_INADIMPLENTE = 'cliente_inadimplente',
  RECEITAS_PLANOS = 'receitas_planos',
  HISTORICO_PAGAMENTOS = 'historico_pagamentos',
}

export class FiltroRelatoriosDto {
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsEnum(TipoRelatorio)
  tipoRelatorio: TipoRelatorio;

  @IsOptional()
  @IsNumber()
  clienteId?: number;

  @IsOptional()
  @IsNumber()
  planoId?: number;

  @IsOptional()
  @IsString()
  tipo?: string;
}
