import { Cliente } from '../clientes/entities/cliente-entity';

@Entity()
export class Fatura {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cliente)
    clientes: Cliente;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

    @Column({ type: 'date' })
    vencimento: Date;

    @Column({ default: false })
    paga: boolean;
}