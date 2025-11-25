import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientesModule } from './clientes/clientes.module';
import { PlanosModule } from './planos/planos-module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Cliente } from './clientes/entities/cliente.entity';
import { Plano } from './planos/entities/plano-entity';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { RadiusModule } from './radius/radius-module';
import { HistoricoModule } from './historico/historico-module';
import { Fatura } from './financeiro/entities/fatura-entity';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { PagamentosModule } from './pagamentos/pagamentos.mudule';
import { BloqueioModule } from './bloqueio/bloqueio-module';
import { RelatoriosModule } from './relatorios/relatorios.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Fatura, Cliente, Plano, __dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ClientesModule,
    PlanosModule,
    UsuariosModule,
    AuthModule,
    FinanceiroModule,
    RadiusModule,
    HistoricoModule,
    NotificacoesModule,
    PagamentosModule,
    BloqueioModule,
    RadiusModule,
    RelatoriosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
