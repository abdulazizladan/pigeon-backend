import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { MonthlyReport } from './entities/report.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReportService {

  constructor(
    @InjectRepository(MonthlyReport)
    private readonly reportRepository: Repository<MonthlyReport>
  ) {

  }
  async create(createReportDto: CreateReportDto) {
    const report = await this.reportRepository.create(createReportDto)
    try {
      this.reportRepository.save(report);
      return {
        success: true,
        data: report,
        message: "Report generated successfully."
      }
    } catch (error) {
      return {
        success: false, 
        error: error.message
      }
    }
  }

  async findAll() {
    const reports = await this.reportRepository.find();
    if( reports.length === 0) {
      return {
        success: true,
        data: null,
        message: "No reports found"
      }
    }else{
      return {
        success: true,
        data: reports,
        message: "Reports found"
      }
    }
  }

  async findOne(id: number) {
    try {
      const report = await this.reportRepository.findOne(
        {
          where: { id },
          relations: [
            'createdBy'
          ]
        }
      );
      if(report) {
        return {
          success: true,
          data: report,
          message: "Report found"
        }
      }else {
        throw new NotFoundException("Report not found")
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    try {
      this.reportRepository.update(id, updateReportDto);
      return {
        success: true,
        data: updateReportDto,
        message: "Report updated successfully"
      }
    }
    catch (error) {
      return {
        success: false,
        message: error.message
      }
    }

  }

  remove(id: number) {
    try {
      this.reportRepository.delete(id);
      return {
        success: true,
        message: "Report deleted successfully"
      }
    }
    catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
