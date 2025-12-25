import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { User } from 'src/user/entities/user.entity';
import { Pump } from './entities/pump.entity';
import { PumpDailyRecord } from './entities/pum-daily-record.entity';
import { RecordSalesDto } from './dto/record-sales.dto';
import { Role } from 'src/user/enums/role.enum';

import { Sale } from 'src/sale/entities/sale.entity';
import { Between } from 'typeorm';

@Injectable()
export class StationService {

  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(Pump) // Inject Pump Repository
    private readonly pumpRepository: Repository<Pump>,
    @InjectRepository(User) // Inject User Repository
    private readonly userRepository: Repository<User>,
    @InjectRepository(PumpDailyRecord)
    private readonly dailyRecordRepository: Repository<PumpDailyRecord>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) { }

  /**
   * Creates a new station in the database, including assigning a manager and creating pumps.
   * @param createStationDto - DTO containing station details, managerId, and pumps array.
   * @returns An object indicating success or failure and a message
   */

  async create(createStationDto: CreateStationDto) {
    // Destructure properties that handle relationships
    const { managerId, pumps, ...stationDetails } = createStationDto; // <-- Destructures 'pumps' array

    try {
      // 1. Handle Manager Assignment (omitted for brevity)
      let manager: User | undefined;
      // ... manager assignment logic

      // 2. Create Station Entity (omitted for brevity)
      const station = this.stationRepository.create({
        ...stationDetails,
        manager: manager,
      });

      // 3. Save the Station
      const newStation = await this.stationRepository.save(station);

      // 4. Handle Pump Creation (if provided) <-- This handles the dynamic array of pumps
      if (pumps && pumps.length > 0) {
        const pumpEntities = pumps.map(pumpDto =>
          this.pumpRepository.create({
            ...pumpDto,
            station: newStation, // Assign the newly created station entity
          })
        );
        // Use insert for bulk creation performance
        await this.pumpRepository.insert(pumpEntities);

        // Re-fetch or manually assign entities for the response
        newStation.pumps = pumpEntities;
      }

      // Return the newly created station object (which now includes pumps if created)
      return newStation;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a summary of station statistics (total, active, inactive).
   * @returns An object containing station stats and a message
   */
  async getSummary() {
    const totalStations = await this.stationRepository.count();
    const activeStations = await this.stationRepository.count({ where: { status: 'active' } });
    const suspendedStations = await this.stationRepository.count({ where: { status: 'suspended' } });

    return {
      total: totalStations,
      active: activeStations,
      suspended: suspendedStations,
    }
  }

  /**
   * Retrieves all stations from the database.
   * @returns A list of all stations.
   */
  async findAll() {
    try {
      const stations = await this.stationRepository.find(
        {
          relations: {
            'manager': {
              'info': true
            },
            'pumps': true,
            'stock': true
          },
          order: {
            stock: {
              dateTaken: 'desc'
            }
          }
        }
      );
      return stations;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a single station by its ID, including the manager relation.
   * @param id - The ID of the station
   * @returns The station object.
   */
  /**
   * Finds the station assigned to a specific manager.
   * @param managerId - The ID of the manager
   * @returns The station entity
   */
  async findMyStation(managerId: string) {
    const station = await this.stationRepository.findOne({
      where: { manager: { id: managerId } },
      relations: ['pumps', 'manager', 'dispensers', 'sales', 'stock']
    });

    if (!station) {
      throw new NotFoundException(`No station assigned to manager ${managerId}`);
    }

    return station;
  }

  async findOne(id: string) {
    try {
      const station = await this.stationRepository.findOne(
        {
          where: { id },
          relations: {
            manager: {
              info: true
            },
            pumps: true,
            dispensers: true
          }
        }
      );
      if (!station) {
        throw new NotFoundException('Station not found');
      }
      return station;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates a station by its ID, including manager assignment.
   * @param id - The ID of the station
   * @param updateStationDto - DTO containing updated station data and optional managerId
   * @returns The updated station data.
   */
  async update(id: string, updateStationDto: UpdateStationDto) {
    // Separate managerId and pumps (pumps are ignored for complex updates here)
    const { managerId, pumps, ...stationDetails } = updateStationDto;

    try {
      // 1. Find the existing station entity
      const existingStation = await this.stationRepository.findOne({ where: { id } });

      if (!existingStation) {
        throw new NotFoundException(`Station with ID ${id} not found`);
      }

      // 2. Handle Manager Assignment (if managerId is provided)
      let managerToAssign: User | undefined | null = undefined;

      if (managerId !== undefined) {
        if (managerId === null || managerId === "") {
          // If managerId is explicitly null/empty string, unassign the current manager
          managerToAssign = null;
        } else {
          // Find the new manager
          const foundManager = await this.userRepository.findOne({ where: { id: managerId } });
          if (!foundManager) {
            throw new NotFoundException(`Manager with ID ${managerId} not found.`);
          }
          // Verify if the user is actually a manager role if needed
          // if (foundManager.role !== Role.manager) { ... }
          managerToAssign = foundManager;
        }
      }

      // 3. Merge Station Details and Manager

      // We can directly merge stationDetails if UpdateStationDto aligns with Station entity.
      // Explicitly typing helps avoid 'as any'
      this.stationRepository.merge(existingStation, stationDetails as Partial<Station>);

      if (managerToAssign !== undefined) {
        existingStation.manager = managerToAssign;
      }

      // 4. Save the merged entity to execute the update
      const updatedStation = await this.stationRepository.save(existingStation);

      return updatedStation;

    } catch (error) {
      // Re-throw known HTTP exceptions to avoid wrapping them in 500
      if (error instanceof NotFoundException) throw error;
      console.error('Error updating station:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates only the status of a station.
   * @param id - The ID of the station
   * @param status - The new status ('active' | 'suspended')
   * @returns The updated station.
   */
  async updateStatus(id: string, status: 'active' | 'suspended') {
    try {
      const station = await this.stationRepository.findOne({ where: { id } });

      if (!station) {
        throw new NotFoundException(`Station with ID ${id} not found`);
      }

      station.status = status;
      return await this.stationRepository.save(station);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Deletes a station by its ID.
   * @param id - The ID of the station
   * @returns An object indicating success or failure and a message
   */
  async remove(id: string) {
    try {
      const result = await this.stationRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Station with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Station deleted successfully'
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Assigns a manager (User) to a Station.
   * @param stationId - The ID of the station
   * @param managerId - The ID of the user to assign as manager
   * @returns The updated station data.
   */
  async assignManager(stationId: string, managerId: string) {
    // 1. Find the existing station entity
    const station = await this.stationRepository.findOne({ where: { id: stationId } });

    if (!station) {
      throw new NotFoundException(`Station with ID ${stationId} not found`);
    }

    // 2. Find the user to be assigned as manager
    const manager = await this.userRepository.findOne({ where: { id: managerId } });

    if (!manager) {
      throw new NotFoundException(`User with ID ${managerId} not found.`);
    }

    // Optional: Add validation that the user's role is 'manager'
    if (manager.role !== Role.manager) {
      throw new BadRequestException(`User with ID ${managerId} is not a Manager. Current role: ${manager.role}`);
    }

    // 3. Assign the manager to the station
    station.manager = manager;

    // 4. Save the updated station entity
    const updatedStation = await this.stationRepository.save(station);

    return updatedStation;
  }

  /**
   * 🏆 Unassigns the current manager from a Station.
   * @param stationId - The ID of the station
   * @returns An object with the updated station data
   */
  async unassignManager(stationId: string) {
    // 1. Find the existing station entity
    const station = await this.stationRepository.findOne(
      {
        where: {
          id: stationId
        },
        relations: {
          manager: true
        }
      }
    );

    if (!station) {
      throw new NotFoundException(`Station with ID ${stationId} not found`);
    }

    // 2. Check if a manager is currently assigned (optional check)
    if (!station.manager) {
      return station;
    }

    // 3. Unassign the manager (set to null)
    station.manager = null;

    // 4. Save the updated station entity
    const updatedStation = await this.stationRepository.save(station);

    // Note: The User entity's `station` field is also updated by TypeORM's
    // cascade/inverse side logic (OneToOne relation).

    return updatedStation;
  }

  async recordDailySales(recordSalesDto: RecordSalesDto) {
    const { pumpId, recordDate, volumeSold, totalRevenue } = recordSalesDto;

    // Use upsert logic: Find existing record for the pump and date
    const existingRecord = await this.dailyRecordRepository.findOne({
      where: {
        pump: { id: pumpId }, // Assuming a Pump entity is needed for relation
        recordDate: new Date(recordDate),
      },
      // Select the pump relation to get the stationId for the record
      relations: ['pump', 'pump.station'],
    });

    // 1. Get the Station ID from the Pump (needed for the denormalized column)
    // You'd need to fetch the pump first if you don't have it.
    // Assuming you have a PumpRepository injected or you fetch it here:
    // const pump = await this.pumpRepository.findOne({ where: { id: pumpId }, relations: ['station'] });
    // const stationId = pump.station.id;

    // For simplicity, we'll assume the Pump entity is correctly linked via TypeORM.
    // If you add the stationId to the DTO, it simplifies things.

    if (existingRecord) {
      // 2. Update existing record (e.g., if a correction is made)
      existingRecord.volumeSold = volumeSold;
      existingRecord.totalRevenue = totalRevenue;
      return this.dailyRecordRepository.save(existingRecord);
    } else {
      // 3. Create a new record
      // NOTE: You must ensure you have the station entity/ID to link it.
      // We will rely on TypeORM to figure out the station from the pump relationship.
      const newRecord = this.dailyRecordRepository.create({
        recordDate: new Date(recordDate),
        volumeSold,
        totalRevenue,
        pump: { id: pumpId } as any, // Only need the ID for relationship insertion
        // station: { id: stationId } as any, // If denormalized column is used
      });
      return this.dailyRecordRepository.save(newRecord);
    }
  }

  /**
   * 🏆 Retrieves daily sales grouped by Station and Day.
   */
  async getAggregatedDailySales() {
    // We use the Query Builder for complex grouping and aggregation.
    const results = await this.dailyRecordRepository.createQueryBuilder('record')
      // Join to Station and Pump entities to access station name
      .innerJoin('record.station', 'station')
      .innerJoin('record.pump', 'pump')

      // Select the grouping columns and aggregation columns
      .select('station.name', 'stationName')
      .addSelect('record.recordDate', 'date')
      .addSelect('SUM(record.volumeSold)', 'totalVolumeSold')
      .addSelect('SUM(record.totalRevenue)', 'totalDailyRevenue')

      // Group the results by the Station Name and the Day
      .groupBy('station.name')
      .addGroupBy('record.recordDate')

      // Order the results for better readability
      .orderBy('record.recordDate', 'DESC')
      .addOrderBy('station.name', 'ASC')

      .getRawMany(); // Use getRawMany to retrieve the custom selected columns

    return {
      success: true,
      data: results,
      message: 'Aggregated daily sales by station retrieved successfully',
    };
  }

  /**
   * Retrieves sales graph data for a station for the past 30 days.
   * Returns separate arrays for Petrol and Diesel sales.
   * @param stationId - The ID of the station
   */
  async getSalesGraph(stationId: string) {
    // 1. Calculate Date Range (Past 30 Days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. Query Sales Grouped by Date and Product
    const salesData = await this.saleRepository
      .createQueryBuilder('sale')
      .select('DATE(sale.createdAt)', 'date')
      .addSelect('sale.product', 'product')
      .addSelect('SUM(sale.totalPrice)', 'dailyTotal')
      .where('sale.stationId = :stationId', { stationId })
      .andWhere('sale.createdAt >= :startDate', { startDate: thirtyDaysAgo })
      .groupBy('DATE(sale.createdAt)')
      .addGroupBy('sale.product')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 3. Process Data into Graph Format
    // Initialize map with all dates in the range to ensure continuous graph
    const labels: string[] = [];
    const petrolData: number[] = [];
    const dieselData: number[] = [];

    // Create a map for quick lookup:  "YYYY-MM-DD" -> { PETROL: 0, DIESEL: 0 }
    const dateMap = new Map<string, { PETROL: number; DIESEL: number }>();

    // Fill the map with the last 30 days (default 0)
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      labels.push(dateStr);
      dateMap.set(dateStr, { PETROL: 0, DIESEL: 0 });
    }

    // Populate with actual data
    salesData.forEach(record => {
      // record.date might be a Date object or string depending on driver, ensure string YYYY-MM-DD
      const dateStr = typeof record.date === 'string' ? record.date.substring(0, 10) : record.date.toISOString().substring(0, 10);

      if (dateMap.has(dateStr)) {
        const entry = dateMap.get(dateStr);
        const amount = parseFloat(record.dailyTotal);
        if (record.product === 'PETROL') entry.PETROL += amount;
        else if (record.product === 'DIESEL') entry.DIESEL += amount;
      }
    });

    // Build the final arrays
    labels.forEach(date => {
      const entry = dateMap.get(date);
      petrolData.push(entry.PETROL);
      dieselData.push(entry.DIESEL);
    });

    return {
      labels,
      datasets: [
        { label: 'Petrol Sales', data: petrolData, borderColor: '#4CAF50', backgroundColor: '#4CAF50' }, // Example colors
        { label: 'Diesel Sales', data: dieselData, borderColor: '#FFC107', backgroundColor: '#FFC107' }
      ]
    };
  }

  async getStationSummary(stationId: string) {
    try {
      // 1. Fetch Station with Pumps and Volume Info
      const station = await this.stationRepository.findOne({
        where: { id: stationId },
        relations: ['pumps'], // We need to count pumps
      });

      if (!station) {
        throw new NotFoundException(`Station with ID ${stationId} not found`);
      }

      // 2. Calculate Pump Ratio
      // Since Pump entity currently lacks a 'status' field, we assume all pumps are working.
      // If a status field is added later, update this logic (e.g., filter by status === 'active').
      const totalPumps = station.pumps ? station.pumps.length : 0;
      const workingPumps = totalPumps; // Placeholder assumption
      const nonWorkingPumps = 0; // Placeholder assumption

      // 3. Calculate Yesterday's Sales
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

      const yesterdaySalesResult = await this.saleRepository
        .createQueryBuilder('sale')
        .select('SUM(sale.totalPrice)', 'total')
        .where('sale.stationId = :stationId', { stationId })
        .andWhere('sale.createdAt BETWEEN :start AND :end', { start: startOfYesterday, end: endOfYesterday })
        .getRawOne();

      const yesterdaySales = yesterdaySalesResult && yesterdaySalesResult.total ? parseFloat(yesterdaySalesResult.total) : 0;

      // 4. Calculate Cumulative Sales for Past 30 Days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesHistory = await this.saleRepository
        .createQueryBuilder('sale')
        .select('DATE(sale.createdAt)', 'date')
        .addSelect('SUM(sale.totalPrice)', 'dailyTotal')
        .where('sale.stationId = :stationId', { stationId })
        .andWhere('sale.createdAt >= :startDate', { startDate: thirtyDaysAgo })
        .groupBy('DATE(sale.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      return {
        stationId: station.id,
        fuelLevels: {
          petrol: station.petrolVolume,
          diesel: station.dieselVolume,
        },
        pumpStatus: {
          working: workingPumps,
          nonWorking: nonWorkingPumps,
          ratio: `${workingPumps}:${nonWorkingPumps}`,
        },
        sales: {
          yesterday: yesterdaySales,
          history: salesHistory.map(record => ({
            date: record.date,
            total: parseFloat(record.dailyTotal),
          })),
        }
      };

    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

}
