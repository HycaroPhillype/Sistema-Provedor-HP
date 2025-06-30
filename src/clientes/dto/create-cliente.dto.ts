/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty, IsBoolean, Length, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';


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
    plano: string;
    
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