import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CriarPagamentoDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    faturaId: number;
}