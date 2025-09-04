import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity()
export class Plano {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column('int')
  planoDownload: number;

  @Column('int')
  planoUpload: number;

  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => Cliente, (cliente) => cliente.planos)
  clientes: Cliente[];
}
