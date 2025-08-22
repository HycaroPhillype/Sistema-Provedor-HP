import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plano } from './entities/plano-entity';

@Injectable()
export class PlanosService {
  constructor(
    @InjectRepository(Plano)
    private plansRepo: Repository<Plano>,
  ) {}

  async create(planData: Partial<Plano>): Promise<Plano> {
    const newPlan = this.plansRepo.create(planData);

    return this.plansRepo.save(newPlan);
  }

  async searchAll(): Promise<Plano[]> {
    return this.plansRepo.find();
  }

  async searchActive(): Promise<Plano[]> {
    return this.plansRepo.find({
      where: { ativo: true },
    });
  }

  async searchById(id: number): Promise<Plano | null> {
    return this.plansRepo.findOneBy({ id });
  }

  async update(id: number, updatedData: Partial<Plano>): Promise<Plano> {
    await this.plansRepo.update(id, updatedData);
    const plano = await this.plansRepo.findOneBy({ id });
    if (!plano) {
      throw new Error(`Plano com id ${id} não encontraedo`);
    }
    return plano;
  }

  async disable(id: number): Promise<Plano> {
    await this.plansRepo.update(id, { ativo: false });
    const plano = await this.plansRepo.findOneBy({ id });
    if (!plano) {
      throw new Error(`Plano com id ${id} não encontrado`);
    }
    return plano;
  }

  async remove(id: number): Promise<void> {
    await this.plansRepo.delete(id);
  }
}
