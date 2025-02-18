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

  create(createStationDto: CreateStationDto) {
    return 'This action adds a new station';
  }

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
          data: null
        }
      }else {
        return {
          success: true,
          data: station
        }
      }
      }catch (error) {
        return {
          success: false,
          error: error.message
        }
      }
  }

  update(id: number, updateStationDto: UpdateStationDto) {
    return `This action updates a #${id} station`;
  }

  remove(id: number) {
    return `This action removes a #${id} station`;
  }
}
