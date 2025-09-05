import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro-service';
import { Fatura } from './entities/fatura-entity';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFaturaDto } from './dto/update-fatura.dto';

@Controller('financeiro')
@UseGuards(JwtAuthGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('faturas')
  createFatura(@Body() createFaturaDto: CreateFaturaDto): Promise<Fatura> {
    return this.financeiroService.createFatura(createFaturaDto);
  }

  @Get('fatura')
  searchAllFaturas(): Promise<Fatura[]> {
    return this.financeiroService.searchAllFaturas();
  }

  @Get('fatuas/cleinte/:clienteId')
  searchFaturasByClienteId(
    @Param('clienteId') clienteId: number,
  ): Promise<Fatura[]> {
    return this.financeiroService.searchFaturasByCliente(clienteId);
  }

  @Put('fatuas/:id')
  updateFatura(
    @Param('id') id: number,
    @Body() updateFaturaDto: UpdateFaturaDto,
  ): Promise<Fatura> {
    return this.financeiroService.updateFatura(id, updateFaturaDto);
  }

  @Delete('fatuas/:id')
  removeFatuara(@Param('id') id: number): Promise<void> {
    return this.financeiroService.removeFatura(id);
  }

  @Get('faturas/periodo')
  searchFatuasByPeriodo(
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ): Promise<Fatura[]> {
    return this.financeiroService.searchFaturasByPeriod(
      new Date(inicio),
      new Date(fim),
    );
  }

  @Get('inadiplentes')
  async searchInadiplentes(): Promise<any[]> {
    return await this.financeiroService.searchDefaulters();
  }

  @Post('fatuas/gerar-mensal')
  gerarFaturasMensais(): Promise<string> {
    this.financeiroService.generateFaturasMensais();

    return Promise.resolve('Faturas mensais geradas com sucesso.');
  }
}
