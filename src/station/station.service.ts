import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationService {

  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
  ) {}

  /**
   * Creates a new station in the database.
   * @param createStationDto - DTO containing station details
   * @returns An object indicating success or failure and a message
   */
  async create(createStationDto: CreateStationDto) {
    const station = await this.stationRepository.create(createStationDto);
    try {
      this.stationRepository.save(station)
      return {
        success: true,
        message: 'Station created successfully',
      }
    } catch (error ) {
      return {
        success: false,
        message: 'Error creating station',
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
  async findOne(id: number) {
    const station = await this.stationRepository.findOne(
      {
        where: { id },
        relations: [
          'manager'
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
   * Updates a station by its ID.
   * @param id - The ID of the station
   * @param updateStationDto - DTO containing updated station data
   * @returns An object indicating success or failure and a message
   */
  update(id: number, updateStationDto: UpdateStationDto) {
    try {
      this.stationRepository.update(id, updateStationDto);
      return {
        success: true,
        data: updateStationDto,
        message: 'Station updated successfully'
      }
    }catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Deletes a station by its ID.
   * @param id - The ID of the station
   * @returns An object indicating success or failure and a message
   */
  remove(id: number) {
    try {
      this.stationRepository.delete(id);
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
