import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationModule } from './station/station.module';
import { SaleModule } from './sale/sale.module';
import { DispenserModule } from './dispenser/dispenser.module';
import { ReportModule } from './report/report.module';
import { TicketModule } from './ticket/ticket.module';
import { ChatGateway } from './chat.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupplyModule } from './supply/supply.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLogInterceptor } from './activity-log/activity-log.interceptor';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    //TypeOrmModule.forRoot({
    //  type: 'mysql',
    //  host: '102.209.117.55', // or your MySQL host
    //  port: 3306, // or your MySQL port
    //  username: 'ladanski_pigeon_admin',
    //  password: '2wo1ne8ight',
    //  database: 'ladanski_pigeon_db',
    //  entities: [__dirname + '/**/*.entity{.ts,.js}'], // path to your entity files
    //  synchronize: true, // set to false in production
    //}),
    AuthModule,
    UserModule,
    StationModule,
    SaleModule,
    DispenserModule,
    ReportModule,
    TicketModule,
    SupplyModule,
    AnalyticsModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ChatGateway,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
})
export class AppModule { }
