import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { WebhookPagamentoDto } from './dto/webhook-pagamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('webhook')
  async webhook(
    @Body() webhookDto: WebhookPagamentoDto,
    @Headers('x-sgignature') signature: string,
  ) {
    await this.pagamentosService.processarWebhook(webhookDto);
    return { received: true };
  }

  @Get('status/:transacaoId')
  @UseGuards(JwtAuthGuard)
  async verificarStatus(@Param('transacaoId') transacaoId: string) {
    return this.pagamentosService.verificarStatus(transacaoId);
  }

  @Get('cliente/:clienteId')
  @UseGuards(JwtAuthGuard)
  async listarTransacoes(@Param('clienteId') clienteId: number) {
    return this.pagamentosService.listarTransacoes(clienteId);
  }
}
