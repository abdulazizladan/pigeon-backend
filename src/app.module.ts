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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule, 
    AuthModule,
    StationModule, 
    SaleModule, 
    DispenserModule, 
    ReportModule, 
    TicketModule,
  ],
  controllers: [],
  providers: [
    ChatGateway
  ],
})
export class AppModule {}
