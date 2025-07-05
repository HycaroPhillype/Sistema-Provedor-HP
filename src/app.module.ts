import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'proverdor_hp',
      password: 'proverdor_hp',
      database: 'proverdor_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true
    }),
    ClientesModule
  ],
})
export class AppModule {}

