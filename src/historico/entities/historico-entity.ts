import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class HistoricoCliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clienteId: number;

  @Column()
  acao: string; // Ex: 'NOTIFICACAO_VENCIMENTO', 'NOTIFICACAO_ATRASO', 'BLOQUEIO', etc.

  @Column({ type: 'text', nullable: true })
  descricao: string; // Descrição detalhada da ação

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data: Date;
}