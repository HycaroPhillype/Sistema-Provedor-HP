import { Cliente } from '../../clientes/entities/cliente.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
@Entity()
export class Fatura {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.faturas)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column()
  clienteId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  dataVencimento: Date;

  @Column({ default: false })
  paga: boolean;

  @Column({ type: 'date', nullable: true })
  observacao: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  dataCriacao: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataPagamento: Date;
}
