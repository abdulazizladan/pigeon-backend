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
    //TypeOrmModule.forRoot({
      // 1. Change the type to 'mysql' (or 'postgres' if applicable)
    //  type: 'mysql',
    
      // 2. Specify the remote server details
    //  host: 'sql8.freesqldatabase.com',
    //  port: 3306, // Default MySQL port, adjust if needed
    //  username: 'sql8807217',
    //  password: '37iiRsQM5G',
    //  database: 'sql8807217',
    
      // 3. Keep existing settings for entities and synchronization
    //  entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //  synchronize: true, // Be cautious with 'synchronize: true' in production
    //}),
    AuthModule,
    UserModule, 
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
