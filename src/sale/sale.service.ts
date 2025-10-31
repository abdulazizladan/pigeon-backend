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
import { Station } from 'src/station/entities/station.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pump)
    private readonly pumpRepository: Repository<Pump>,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>
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
    // IMPORTANT: Using pumpId from DTO
    where: { 
      id: createSaleDto.pumpId 
    }, 
    relations: [
      'station'
    ], // Eagerly load the Station relation
  });

  if (!pump) {
    throw new NotFoundException(`Pump with ID ${createSaleDto.pumpId} not found`);
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

  // Calculate total price and round to 4 decimal places for monetary consistency
  const totalPrice = parseFloat((volumeLiters * createSaleDto.pricePerLitre).toFixed(4)); 

  // 3. Create and Save the Sale entity
  const sale = this.saleRepository.create({
    // Input fields from DTO
    product: createSaleDto.product,
    pricePerLitre: createSaleDto.pricePerLitre,
    openingMeterReading: createSaleDto.openingMeterReading,
    closingMeterReading: createSaleDto.closingMeterReading,
    
    // Calculated fields
    totalPrice: totalPrice, // CRITICAL: Now correctly assigning the calculated field

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
      { relations: 
        [
          'pump', 
          'station'
        ]
      }
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
        'pump', 
        'station',
        'recordedBy'
      ],
    });
    if (!sale) {
      throw new NotFoundException(`Sale record with ID ${id} not found`);
    }
    return sale;
  }

  async findAllByStationID(stationId: string) {
    const station = await this.stationRepository.findOne({
      where: {id: stationId}
    })
    if(!station) {
      throw new NotFoundException("Station not found")
    }
    const sales = await this.saleRepository.find({
      where: { station: station },
      relations: [
        'station'
      ]
    })
    if(!sales) {
      throw new NotFoundException("No sales record for this station found")
    }
    return sales;
  }

  /**
   * Update a sale by ID.
   * @param id - The ID of the sale
   * @param updateSaleDto - DTO containing updated sale data
   * @returns The updated sale entity
   */
  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const existingSale = await this.saleRepository.findOneBy({ id });

    if (!existingSale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    // 1. Merge the DTO data onto the existing entity
    this.saleRepository.merge(existingSale, updateSaleDto);

    // 2. Recalculate totalPrice if meter readings or price changed
    const volumeLiters = existingSale.closingMeterReading - existingSale.openingMeterReading;
    
    if (volumeLiters <= 0) {
        throw new BadRequestException('Closing meter reading must be greater than the opening meter reading after update.');
    }

    // Recalculate and assign the new total price
    existingSale.totalPrice = parseFloat((volumeLiters * existingSale.pricePerLitre).toFixed(4));
    
    // 3. Save the entity to trigger listeners and update all fields
    return this.saleRepository.save(existingSale);
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
  // The reporting methods are now sound, as 'totalPrice' is persisted.

  /**
   * 💰 Calculates the total monetary sales from all records.
   * @returns The sum of all total_price values.
   */
  async getTotalSale(): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total_price)', 'totalSale') // Use column name 'total_price'
      .getRawOne();
    
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
      .select('SUM(sale.total_price)', 'totalSale') // Use column name 'total_price'
      .where('sale.station_id = :stationId', { stationId }) // Use foreign key column name
      .getRawOne();

    return parseFloat(result.totalSale || 0);
  }

  /**
   * 📅 Calculates the total sales grouped by the week of the year.
   * @returns An array of objects: [{ week: number, totalSale: number }]
   */
  async getTotalSalesPerWeek(): Promise<any[]> {
    const rawSalesData = await this.saleRepository
      .createQueryBuilder('sale')
      .select("STRFTIME('%W', sale.created_at)", 'week') // Use column name 'created_at'
      .addSelect('SUM(sale.total_price)', 'totalSale') // Use column name 'total_price'
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
    const rawSalesData = await this.saleRepository
      .createQueryBuilder('sale')
      .select("STRFTIME('%Y-%m', sale.created_at)", 'month') // Use column name 'created_at'
      .addSelect('SUM(sale.total_price)', 'totalSale') // Use column name 'total_price'
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return rawSalesData.map(data => ({
        month: data.month,
        totalSale: parseFloat(data.totalSale),
    }));
  }
}