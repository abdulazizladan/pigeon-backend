import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { StationsModule } from './stations/stations.module';
import { SalesModule } from './sales/sales.module';
import { ManagersModule } from './managers/managers.module';
import { ActivitiesModule } from './activities/activities.module';
import { ProductsModule } from './products/products.module';
import { PumpsModule } from './pumps/pumps.module';
import { ReservoirsModule } from './reservoirs/reservoirs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'pigeon.sqlite',
      autoLoadEntities: true,
      synchronize: true, // Only for development
    }),
    ActivitiesModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    StationsModule,
    ProductsModule,
    PumpsModule,
    ReservoirsModule,
    SalesModule,
    ManagersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
