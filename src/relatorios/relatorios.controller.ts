import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { RelatirosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FiltroRelatoriosDto } from './dto/filtro-relatorios.dto';

@Controller('relatorios')
@UseGuards(JwtAuthGuard)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatirosService) {}

  @Post()
  async gerarRelatorio(@Body() filtroRelatorioDto: FiltroRelatoriosDto) {
    return this.relatoriosService.gerarRelatorio(filtroRelatorioDto);
  }

  @Get('dashboard')
  async dashboard() {
    return this.relatoriosService.dashboard();
  }
}
