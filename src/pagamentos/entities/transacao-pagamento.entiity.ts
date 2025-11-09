import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Fatura } from '../../financeiro/entities/fatura-entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity()
export class TransacaoPagamento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Fatura)
  @JoinColumn({ name: 'faturaId' })
  fatura: Fatura;

  @Column({ name: 'fatura_id' })
  faturaId: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'cliente_id' })
  clienteId: number;

  @Column({ unique: true })
  transacaoId: string;

  @Column()
  status: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'text' })
  urlPagamento: string;

  @Column({ type: 'json', nullable: true})
  dadosPagamento: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataAtualizacao: Date;

  @Column({ type: 'timestamp', nullable: true })
  dataPagamento: Date;

}
