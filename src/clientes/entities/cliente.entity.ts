import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Plano } from '../../planos/entities/plano-entity';
import { Fatura } from '../../financeiro/entities/fatura-entity';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 100 })
  endereco: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefone?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column()
  plano: string;

  @Column({ nullable: true })
  ip_assinante: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  login: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  senha: string;

  @Column({
    default: true,
  })
  ativo: boolean;

  @Column({
    type: 'date',
    nullable: true,
  })
  data_instalacao?: Date;

  @ManyToOne(() => Plano, (plano) => plano.clientes)
  @JoinColumn({ name: 'plano_id' })
  planos: Plano;

  @Column({ name: 'plano_id' })
  planoId: number;

  @OneToMany(() => Fatura, (fatura) => fatura.cliente)
  faturas: Fatura[];
}
