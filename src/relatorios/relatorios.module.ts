// src/app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { ClientesModule } from '../clientes/clientes.module';
import { PlanosModule } from '../planos/planos-module';
import { AuthModule } from '../auth/auth.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { HistoricoModule } from '../historico/historico-module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { PagamentosModule } from '../pagamentos/pagamentos.mudule';
import { BloqueioModule } from '../bloqueio/bloqueio-module';
import { RadiusModule } from '../radius/radius-module';
import { RelatoriosModule } from '../relatorios/relatorios.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
    }),
    ClientesModule,
    PlanosModule,
    AuthModule,
    UsuariosModule,
    FinanceiroModule,
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

export { RelatoriosModule };
