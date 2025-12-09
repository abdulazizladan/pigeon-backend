import { Inject, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
  ) { }

  /**
   * Creates a new monthly report in the database.
   * @param createReportDto - DTO containing report details
   * @returns An object indicating success or failure, the report data, and a message
   */
  async create(createReportDto: CreateReportDto) {
    const report = this.reportRepository.create(createReportDto)
    try {
      return await this.reportRepository.save(report);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves all monthly reports from the database.
   * @returns An object with all reports or a message if none are found
   */
  async findAll() {
    try {
      return await this.reportRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
      if (!report) {
        throw new NotFoundException("Report not found")
      }
      return report;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates a report by its ID.
   * @param id - The ID of the report
   * @param updateReportDto - DTO containing updated report data
   * @returns An object indicating success or failure and a message
   */
  async update(id: string, updateReportDto: UpdateReportDto) {
    try {
      const result = await this.reportRepository.update(id, updateReportDto);
      if (result.affected === 0) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }
      return this.findOne(id);
    }
    catch (error) {
      throw new InternalServerErrorException(error.message);
    }

  }

  /**
   * Deletes a report by its ID.
   * @param id - The ID of the report
   * @returns An object indicating success or failure and a message
   */
  async remove(id: string) {
    try {
      const result = await this.reportRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }
      return {
        success: true,
        message: "Report deleted successfully"
      }
    }
    catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
