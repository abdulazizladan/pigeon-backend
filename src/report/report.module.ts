import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyReport } from './entities/report.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule, 
    TypeOrmModule.forFeature(
      [
        MonthlyReport
      ]
    )
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
