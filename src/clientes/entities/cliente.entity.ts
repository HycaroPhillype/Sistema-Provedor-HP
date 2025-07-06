import { BlobOptions } from 'buffer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ type: 'varchar', length: 15, nullable: true })telefone?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;
  
  @Column()
  plano: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  login: string; //Usuário PPPoE

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    select: false,
  })
  senha: string; //senha PPPoE

  @Column({
    default: true, // Valor padrão o criar novo cliente
  })
  ativo: boolean;  //Status de bloqueio/liberação

  @Column({
    type: 'date',
    nullable: true,
  })
  data_instalacao?: Date; //Data da primeira ativação
}
