import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Plano {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nome: string

    @Column('int')
    planoDownload: number;

    @Column('int')
    planoUpload: number;

    @Column('decimal', { precision: 10, scale: 2})
    preco: number;

    @Column({ default: true })
    ativo: boolean;

}