import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { User } from 'src/user/entities/user.entity';
import { Pump } from './entities/pump.entity';

@Injectable()
export class StationService {

  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
    @InjectRepository(Pump) // Inject Pump Repository
    private readonly pumpRepository: Repository<Pump>,
    @InjectRepository(User) // Inject User Repository
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new station in the database, including assigning a manager and creating pumps.
   * @param createStationDto - DTO containing station details, managerId, and pumps array.
   * @returns An object indicating success or failure and a message
   */
  async create(createStationDto: CreateStationDto) {
    // Destructure properties that handle relationships
    const { managerId, pumps, ...stationDetails } = createStationDto;
    
    try {
      // 1. Handle Manager Assignment
      let manager: User | undefined;
      if (managerId) {
        manager = await this.userRepository.findOne({ where: { id: managerId } });
        if (!manager) {
          return { success: false, message: `User with ID ${managerId} (manager) not found.` };
        }
      }

      // 2. Create Station Entity
      const station = this.stationRepository.create({
        ...stationDetails,
        manager: manager, // Assign the manager object
      });

      // 3. Save the Station (must be saved before pumps can reference its ID)
      const newStation = await this.stationRepository.save(station);

      // 4. Handle Pump Creation (if provided)
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
        // Using save is usually better if you need the entities back immediately with their IDs
        // For simplicity and immediate return, we'll stick to a manual assignment:
        newStation.pumps = pumpEntities;
      }
      
      // Return the newly created station object (which now includes pumps if created)
      return {
        success: true,
        data: newStation,
        message: 'Station and associated entities created successfully',
      }
    } catch (error ) {
      console.error('Error creating station:', error);
      return {
        success: false,
        message: 'Error creating station',
        error: error.message
      }
    }
  }

  /**
   * Retrieves a summary of station statistics (total, active, inactive).
   * @returns An object containing station stats and a message
   */
  async getSummary() {
    const totalStations = await this.stationRepository.count();
    const activeStations = await this.stationRepository.count({where: { status: 'active' }});
    const inactiveStations = await this.stationRepository.count({where: { status: 'inactive' }});

    return {
      success: true,
      data: {
        total: totalStations,
        active: activeStations,
        inactive: inactiveStations,
      },
      message: 'Station stats found'
    }
  }

  /**
   * Retrieves all stations from the database.
   * @returns An object with all stations or a message if none are found
   */
  async findAll() {
    const stations = await this.stationRepository.find();
    try {
      if( stations.length === 0) {
      return {
        success: true,
        data: null,
        message: 'No stations found'
      }
      }else 
      return {
        success: true,
        data: stations,
        message: 'Stations found'
      }
    }catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Retrieves a single station by its ID, including the manager relation.
   * @param id - The ID of the station
   * @returns An object with the station or a message if not found
   */
  async findOne(id: string) {
    const station = await this.stationRepository.findOne(
      {
        where: { id },
        relations: [
          'manager', 'pumps' // Also include pumps in findOne
        ]
      }
    );
    try {
      if( station === null) {
        return {
          success: false,
          data: null,
          message: 'Station not found'
        }
      }else {
        return {
          success: true,
          data: station,
          message: 'Station found'
        }
      }
      }catch (error) {
        return {
          success: false,
          error: error.message
        }
      }
  }

  /**
   * Updates a station by its ID, including manager assignment.
   * * @param id - The ID of the station (string assumed for UUID primary key)
   * @param updateStationDto - DTO containing updated station data and optional managerId
   * @returns An object with the updated station data or a message if not found
   */
  async update(id: string, updateStationDto: UpdateStationDto) {
    // Separate managerId and pumps (pumps are ignored for complex updates here)
    const { managerId, pumps, ...stationDetails } = updateStationDto;

    try {
      // 1. Find the existing station entity
      const existingStation = await this.stationRepository.findOne({ where: { id } });

      if (!existingStation) {
        return {
          success: false,
          data: null,
          message: `Station with ID ${id} not found`,
        };
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
                  return { success: false, message: `Manager not found.` };
              }
              managerToAssign = foundManager;
          }
      }
      
      // 3. Merge Station Details and Manager
      // Note: We ignore the 'pumps' field from the DTO for updates, as complex nested array updates 
      // (like adding/deleting pumps) are usually handled via dedicated endpoints/service methods.
      // We use the TypeORM save pattern to merge and update the database record.

      // Fix type incompatibility: ensure status is typed as partial/"active"|"inactive" if present
      const mergedDetails = { ...stationDetails };

      if (mergedDetails.status !== undefined) {
        // Coerce status to correct enum (if needed)
        mergedDetails.status = mergedDetails.status as any;
      }

      // Fix type incompatibility for 'status': convert to correct enum if necessary
      if (mergedDetails.status !== undefined) {
        // Assuming the enum is 'active' | 'inactive'
        if (
          mergedDetails.status !== 'active' &&
          mergedDetails.status !== 'inactive'
        ) {
          // Default or error (optional), but TypeORM will complain if not correct value
          mergedDetails.status = undefined;
        }
      }

      // Merge updated fields into existingStation (type-safe for DeepPartial<Station>)
      this.stationRepository.merge(existingStation, mergedDetails as any); // 'as any' if cast required to satisfy DeepPartial, else use proper StationPartial type

      if (managerToAssign !== undefined) {
        existingStation.manager = managerToAssign;
      }


      // 4. Save the merged entity to execute the update
      const updatedStation = await this.stationRepository.save(existingStation);

      return {
        success: true,
        data: updatedStation,
        message: 'Station updated successfully',
      };

    } catch (error) {
      // Handle potential database errors or validation errors
      console.error('Error updating station:', error);
      return {
        success: false,
        message: 'Error updating station',
        error: error.message,
      };
    }
  }

  /**
   * Deletes a station by its ID.
   * @param id - The ID of the station (string assumed for consistency)
   * @returns An object indicating success or failure and a message
   */
  async remove(id: string) {
    try {
      const result = await this.stationRepository.delete(id);
      
      if (result.affected === 0) {
        return {
          success: false,
          message: `Station with ID ${id} not found`,
        }
      }

      return {
        success: true,
        message: 'Station deleted successfully'
      }
    }catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
