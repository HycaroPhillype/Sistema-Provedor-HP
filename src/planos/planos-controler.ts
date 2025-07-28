import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { PlanosService } from './planos-service';
import { Plano } from './entities/plano-entity';

@Controller('planos')
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  @Post()
  create(@Body() planData: Plano): Promise<Plano> {
    return this.planosService.create(planData);
  }

  @Get()
  searchAll(): Promise<Plano[]> {
    return this.planosService.searchAll();
  }

  @Get('id')
  searchOn(@Param('id') id: string): Promise<Plano> {
    return this.planosService.searchById(Number(id));
  }

  @Put('id')
  update(@Param('id') id: string, @Body() updateData: Plano): Promise<Plano> {
    return this.planosService.update(Number(id), updateData);
  }

  @Delete(':id')
  disable(@Param('id') id: string): Promise<Plano> {
    return this.planosService.disable(Number(id));
  }
}
