// src/sale/sale.service.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispenser } from 'src/dispenser/entities/dispenser.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { User } from 'src/user/entities/user.entity';
import { Pump } from 'src/station/entities/pump.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Dispenser)
    private readonly dispenserRepository: Repository<Dispenser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pump)
    private readonly pumpRepository: Repository<Pump>
  ) {}

  // --- CRUD Methods (Refactored for cleaner data/error handling) ---

  /**
 * Records a new sale transaction.
 * @param createSaleDto - DTO containing sale details
 * @param userId - The ID of the authenticated user recording the sale.
 * @returns The created Sale entity.
 */
async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
  // 1. Fetch related entities (Pump and User)
  const pump = await this.pumpRepository.findOne({
    where: { id: createSaleDto.dispenserId },
    relations: ['station'], // Eagerly load the Station relation
  });

  if (!pump) {
    throw new NotFoundException(`Pump (Dispenser) with ID ${createSaleDto.dispenserId} not found`);
  }

  const user = await this.userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }
  
  // 2. Data Calculation and Validation Check
  const volumeLiters = createSaleDto.closingMeterReading - createSaleDto.openingMeterReading;
  
  if (volumeLiters <= 0) {
    throw new BadRequestException('Closing meter reading must be greater than the opening meter reading.');
  }

  const totalPrice = volumeLiters * createSaleDto.pricePerLitre;

  // 3. Create and Save the Sale entity
  const sale = this.saleRepository.create({
    // Input fields from DTO
    product: createSaleDto.product,
    pricePerLitre: createSaleDto.pricePerLitre,
    openingMeterReading: createSaleDto.openingMeterReading,
    closingMeterReading: createSaleDto.closingMeterReading,
    
    // Calculated fields

    // Relationships
    pump: pump, // Link to the Pump
    station: pump.station, // Link to the Station (derived from Pump)
    recordedBy: user, // Link to the recording User
  });
 
  return this.saleRepository.save(sale);
}
  /**
   * Get all sales records.
   * @returns An array of all sale entities
   */
  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find(
      /**{ relations: 
        [
          'dispenser', 
          'station'
        ]
      }**/
    );
  }

  /**
   * Get a single sale by ID.
   * @param id - The ID of the sale
   * @returns The found sale entity
   */
  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: [
        'dispenser', 
        'station'
      ],
    });
    if (!sale) {
      throw new NotFoundException(`Sale record with ID ${id} not found`);
    }
    return sale;
  }

  /**
   * Update a sale by ID.
   * @param id - The ID of the sale
   * @param updateSaleDto - DTO containing updated sale data
   * @returns The updated sale entity
   */
  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const result = await this.saleRepository.update({ id }, updateSaleDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    // Fetch and return the updated entity
    return this.findOne(id);
  }

  /**
   * Delete a sale by ID.
   * @param id - The ID of the sale
   */
  async remove(id: string): Promise<void> {
    const result = await this.saleRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
  }

  // --- New Reporting Methods ---

  /**
   * 💰 Calculates the total monetary sales from all records.
   * @returns The sum of all total_price values.
   */
  async getTotalSale(): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalPrice)', 'totalSale')
      .getRawOne();
    
    // Ensure the result is converted to a number, as SUM returns a string.
    return parseFloat(result.totalSale || 0);
  }

  /**
   * 🗺️ Calculates the total monetary sales for a specific station.
   * @param stationId - The ID of the station to filter by.
   * @returns The sum of total_price for the specified station.
   */
  async getTotalSalesByStationId(stationId: string): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalPrice)', 'totalSale')
      .where('sale.stationId = :stationId', { stationId })
      .getRawOne();

    return parseFloat(result.totalSale || 0);
  }

  /**
   * 📅 Calculates the total sales grouped by the week of the year.
   * @returns An array of objects: [{ week: number, totalSale: number }]
   */
  async getTotalSalesPerWeek(): Promise<any[]> {
    // Note: Date formatting functions (STRFTIME) are SQLite-specific.
    // For portability (Postgres/MySQL), you would use functions like TO_CHAR or DATE_FORMAT.
    
    // Using STRFTIME for SQLite compatibility (assuming SQLite backend as per prompt)
    const rawSalesData = await this.saleRepository
      .createQueryBuilder('sale')
      .select("STRFTIME('%W', sale.createdAt)", 'week') // '%W' for week number (00-53)
      .addSelect('SUM(sale.totalPrice)', 'totalSale')
      .groupBy('week')
      .orderBy('week', 'ASC')
      .getRawMany();

    return rawSalesData.map(data => ({
        week: parseInt(data.week, 10),
        totalSale: parseFloat(data.totalSale),
    }));
  }

  /**
   * 🗓️ Calculates the total sales grouped by the month of the year.
   * @returns An array of objects: [{ month: string, totalSale: number }]
   */
  async getTotalSalesPerMonth(): Promise<any[]> {
    // Using STRFTIME for SQLite compatibility
    const rawSalesData = await this.saleRepository
      .createQueryBuilder('sale')
      .select("STRFTIME('%Y-%m', sale.createdAt)", 'month') // '%Y-%m' for Year-Month (e.g., '2025-10')
      .addSelect('SUM(sale.totalPrice)', 'totalSale')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return rawSalesData.map(data => ({
        month: data.month,
        totalSale: parseFloat(data.totalSale),
    }));
  }
}