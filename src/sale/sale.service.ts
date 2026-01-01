// src/sale/sale.service.ts

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispenser } from 'src/dispenser/entities/dispenser.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { User } from 'src/user/entities/user.entity';
import { Pump } from 'src/station/entities/pump.entity';
import { Station } from 'src/station/entities/station.entity';
import { PumpDailyRecord } from 'src/station/entities/pum-daily-record.entity';

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
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(PumpDailyRecord)
    private readonly dailyRecordRepository: Repository<PumpDailyRecord>,
    private readonly dataSource: DataSource,
  ) { }

  // --- CRUD Methods (Refactored for cleaner data/error handling) ---

  /**
 * Records a new sale transaction.
 * @param createSaleDto - DTO containing sale details
 * @param userId - The ID of the authenticated user recording the sale.
 * @returns The created Sale entity.
 */
  async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
    // 1. Fetch related entities (Pump and User) in parallel for performance
    const [pump, user] = await Promise.all([
      this.pumpRepository.findOne({
        where: { id: createSaleDto.pumpId },
        relations: ['station'], // Eagerly load the Station relation
      }),
      this.userRepository.findOne({
        where: { id: userId },
      }),
    ]);

    if (!pump) {
      throw new NotFoundException(`Pump with ID ${createSaleDto.pumpId} not found`);
    }

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 2. Data Calculation and Validation Check
    const volumeLiters = createSaleDto.closingMeterReading - createSaleDto.openingMeterReading;

    if (volumeLiters <= 0) {
      throw new BadRequestException('Closing meter reading must be greater than the opening meter reading.');
    }

    // 🏆 OPTIMIZATION: Fetch Price from Station Source of Truth
    // prevent frontend price manipulation.
    let currentPrice = 0;
    const station = pump.station;

    // Check product type and get corresponding price from station
    // We assume explicit specific prices take precedence, then generic station price, then DTO (fallback)
    if (createSaleDto.product === 'PETROL' && station.petrolPricePerLitre > 0) {
      currentPrice = station.petrolPricePerLitre;
    } else if (createSaleDto.product === 'DIESEL' && station.dieselPricePerLitre > 0) {
      currentPrice = station.dieselPricePerLitre;
    } else if (station.petrolPricePerLitre > 0) {
      currentPrice = station.petrolPricePerLitre;
    } else {
      // Fallback to DTO price if server-side prices are not configured (0)
      currentPrice = createSaleDto.pricePerLitre;
    }

    // Calculate total price and round to 4 decimal places for monetary consistency
    const totalPrice = parseFloat((volumeLiters * currentPrice).toFixed(4));

    // 3. Create and Save the Sale entity
    const sale = this.saleRepository.create({
      // Input fields from DTO
      product: createSaleDto.product,
      pricePerLitre: currentPrice, // Use the trusted server-side price
      openingMeterReading: createSaleDto.openingMeterReading,
      closingMeterReading: createSaleDto.closingMeterReading,

      // Calculated fields
      totalPrice: totalPrice,

      // Relationships
      pump: pump, // Link to the Pump
      station: pump.station, // Link to the Station (derived from Pump)
      recordedBy: user, // Link to the recording User
    });

    // Use a transaction to ensure both Sale and DailyRecord are updated or neither
    return this.dataSource.transaction(async (manager) => {
      const savedSale = await manager.save(sale);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dailyRecord = await manager.findOne(PumpDailyRecord, {
        where: {
          pump: { id: pump.id },
          recordDate: today,
        },
      });

      if (!dailyRecord) {
        dailyRecord = manager.create(PumpDailyRecord, {
          pump: pump,
          station: pump.station,
          recordDate: today,
          volumeSold: 0,
          totalRevenue: 0,
        });
      }

      // Accumulate volume and revenue
      dailyRecord.volumeSold = Number(dailyRecord.volumeSold) + volumeLiters;
      dailyRecord.totalRevenue = Number(dailyRecord.totalRevenue) + totalPrice;

      await manager.save(dailyRecord);

      return savedSale;
    });
  }

  /**
   * Get all sales records.
   * @returns An array of all sale entities
   */
  async findAll(page: number = 1, limit: number = 20): Promise<{ data: Sale[], total: number }> {
    const [data, total] = await this.saleRepository.findAndCount({
      relations: ['pump', 'station'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });
    return { data, total };
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
      where: { id: stationId }
    })
    if (!station) {
      throw new NotFoundException("Station not found")
    }
    const sales = await this.saleRepository.find({
      where: { station: { id: stationId } },
      relations: [
        'station'
      ]
    })
    if (!sales || sales.length === 0) {
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
      .where('sale.stationId = :stationId', { stationId }) // Use foreign key column name
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
      .select("STRFTIME('%W', sale.createdAt)", 'week') // Use column name 'createdAt'
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
      .select("STRFTIME('%Y-%m', sale.createdAt)", 'month') // Use column name 'createdAt'
      .addSelect('SUM(sale.total_price)', 'totalSale') // Use column name 'total_price'
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return rawSalesData.map(data => ({
      month: data.month,
      totalSale: parseFloat(data.totalSale),
    }));
  }

  /**
   * 🗓️ Calculated daily sales record per station
   */
  async getDailySalesByStation(stationId: string, date?: string): Promise<PumpDailyRecord[]> {
    const query = this.dailyRecordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.pump', 'pump')
      .where('record.station_id = :stationId', { stationId });

    if (date) {
      query.andWhere('record.recordDate = :date', { date });
    }

    return query.getMany();
  }

  /**
   * 📈 Retrieves the last 30 days of daily sales history for all stations.
   * Useful for collective line graphs.
   */
  async getDailySalesHistory(days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Using query builder to aggregate sales by day
    const history = await this.saleRepository.createQueryBuilder('sale')
      .select("DATE(sale.createdAt)", 'date') // SQLite specific, check DB compatibility
      .addSelect("SUM(sale.total_price)", 'totalSales')
      .where("sale.createdAt >= :startDate", { startDate })
      .groupBy("DATE(sale.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany();

    return history.map(record => ({
      date: record.date,
      totalSales: parseFloat(record.totalSales || 0),
    }));
  }

  /**
   * 📈 Retrieves the last 30 days of daily sales history for a specific station.
   */
  async getDailySalesHistoryByStation(stationId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await this.saleRepository.createQueryBuilder('sale')
      .select("DATE(sale.createdAt)", 'date')
      .addSelect("SUM(sale.total_price)", 'totalSales')
      .where("sale.stationId = :stationId", { stationId })
      .andWhere("sale.createdAt >= :startDate", { startDate })
      .groupBy("DATE(sale.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany();

    return history.map(record => ({
      date: record.date,
      totalSales: parseFloat(record.totalSales || 0),
    }));
  }

  /**
   * 📈 Retrieves the last 30 days of daily CUMULATIVE sales history for all stations.
   */
  async getDailyCumulativeSalesHistory(days: number = 30): Promise<any[]> {
    // 1. Get standard daily sales
    const dailySales = await this.getDailySalesHistory(days);

    // 2. Process into cumulative
    let runningTotal = 0;
    return dailySales.map(record => {
      runningTotal += record.totalSales;
      return {
        date: record.date,
        cumulativeSales: runningTotal
      };
    });
  }

  /**
   * 📈 Retrieves the last 30 days of daily CUMULATIVE sales history for a specific station.
   */
  async getDailyCumulativeSalesHistoryByStation(stationId: string, days: number = 30): Promise<any[]> {
    // 1. Get standard daily sales for station
    const dailySales = await this.getDailySalesHistoryByStation(stationId, days);

    // 2. Process into cumulative
    let runningTotal = 0;
    return dailySales.map(record => {
      runningTotal += record.totalSales;
      return {
        date: record.date,
        cumulativeSales: runningTotal
      };
    });
  }

  /**
   * SEEDING: Generates random sales data for the last 10 days.
   */
  async seedSales() {
    const stations = await this.stationRepository.find({
      relations: ['pumps', 'dispensers', 'manager', 'pumps.station']
    });

    const products = ['PETROL', 'DIESEL'];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Randomly scatter times throughout the workday (8am - 8pm)
      // We will generate a base date and then offset hours/minutes for each sale

      for (const station of stations) {
        // Randomly decide if this station had sales today
        if (Math.random() > 0.9) continue; // 10% chance of no sales

        const numSales = Math.floor(Math.random() * 10) + 5; // 5-15 sales

        for (let j = 0; j < numSales; j++) {
          if (!station.pumps || station.pumps.length === 0) continue;

          const pump = station.pumps[Math.floor(Math.random() * station.pumps.length)];
          // Note: The Pump entity definition seemed to suggest 'dispensedProduct' exists,
          // but if not, we fallback to logic. Checked Pump entity: it has `dispensedProduct`.

          const rawProduct = pump.dispensedProduct ? pump.dispensedProduct.toString() : 'PETROL';
          // Ensure product matches available Enums or Strings expected by Sale.
          // Assuming Sale 'product' is string for now based on entity.

          // Random Dispenser (Staff)
          const dispenser = (station.dispensers && station.dispensers.length > 0)
            ? station.dispensers[Math.floor(Math.random() * station.dispensers.length)]
            : null;

          // Random User (Recorder - fallback to Manager or create a placeholder)
          // For seeding, we might just use the station manager if available, OR find a random user.
          // To avoid complexity, let's use the station manager if exists, else first user in DB?
          // Or just null if nullable? Sale.recordedBy is ManyToOne.
          // Let's assume manager.
          const user = station.manager;

          if (!user) {
            // Skip if no user to record (constraint) or fetch a default admin
            continue;
          }

          const price = rawProduct.toUpperCase() === 'DIESEL' ?
            (station.dieselPricePerLitre || 1100) :
            (station.petrolPricePerLitre || 950);

          const volume = parseFloat((Math.random() * 50 + 5).toFixed(2)); // 5-55 liters
          const totalPrice = parseFloat((volume * price).toFixed(2));

          const openingMeter = 10000 + (j * 100);
          const closingMeter = openingMeter + volume;

          // Create Sale directly to allow overriding 'createdAt'
          const sale = this.saleRepository.create({
            product: rawProduct,
            pricePerLitre: price,
            openingMeterReading: openingMeter,
            closingMeterReading: closingMeter,
            totalPrice: totalPrice,
            pump: pump,
            station: station,
            recordedBy: user,
            dispenser: dispenser,
            createdAt: date // Override default default
          });

          // Adjust time of day
          const hours = 8 + Math.floor(Math.random() * 12); // 08:00 - 20:00
          const minutes = Math.floor(Math.random() * 60);
          sale.createdAt.setHours(hours, minutes, 0, 0);

          await this.saleRepository.save(sale);
        }
      }
    }

    return { message: 'Seeding complete for the last 10 days.' };
  }
}