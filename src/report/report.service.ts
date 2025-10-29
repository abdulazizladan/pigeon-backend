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
  ) {}

  /**
   * Creates a new monthly report in the database.
   * @param createReportDto - DTO containing report details
   * @returns An object indicating success or failure, the report data, and a message
   */
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

  /**
   * Retrieves all monthly reports from the database.
   * @returns An object with all reports or a message if none are found
   */
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

  /**
   * Retrieves a single report by its ID, including the createdBy relation.
   * @param id - The ID of the report
   * @returns An object with the report or a message if not found
   */
  async findOne(id: string) {
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

  /**
   * Updates a report by its ID.
   * @param id - The ID of the report
   * @param updateReportDto - DTO containing updated report data
   * @returns An object indicating success or failure and a message
   */
  update(id: string, updateReportDto: UpdateReportDto) {
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

  /**
   * Deletes a report by its ID.
   * @param id - The ID of the report
   * @returns An object indicating success or failure and a message
   */
  remove(id: string) {
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
