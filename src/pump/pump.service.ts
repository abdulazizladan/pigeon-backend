import { Injectable } from '@nestjs/common';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { Repository } from 'typeorm';
import { Pump } from './entities/pump.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PumpService {
  
  constructor( 
    @InjectRepository(Pump)
    private readonly pumpRepository: Repository<Pump> ) {

  }
  
  create(createPumpDto: CreatePumpDto) {

    return 'This action adds a new pump';
  }

  async findAll() {
    try {
      const pumps = await this.pumpRepository.find();
      if(pumps.length === 0) {
        return {
          success: false,
          message: 'No pumps found'
        }
      }else{
        return {
          success: true,
          message: 'Pumps found',
          data: pumps
        }
      }
    }catch (error) {
      return {
        success: false,
        message: error.message
      } 
    }
  }

  async findByStation(stationId: string) {
    try {
      const pumps = await this.pumpRepository.find({
        where: {
          //station_id: stationId
        }
      });
      if(pumps.length === 0) {
        return {
          success: false,
          message: 'No pumps found'
        }
      }else{
        return {
          success: true,
          message: 'Pumps found',
          data: pumps
        }
      }
    }catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async findOne(id: number) {
    const pump = await this.pumpRepository.findOne({where: {id: id}});
    if(!pump) {
      return {
        success: false,
        message: 'Pump not found'
      }
      }else{
        return {
          success: true,
          message: 'Pump found',
          data: pump
        }
      }
  }

  async update(id: number, updatePumpDto: UpdatePumpDto) {
    const pump = await this.pumpRepository.findOne({where: {id: id}});
  }

  async remove(id: number) {
    const pump = await this.pumpRepository.findOne({where: {id: id}});
    try{
      await this.pumpRepository.delete(id);
      return {
        success: true,
        message: 'Pump deleted'
      }
    }catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
