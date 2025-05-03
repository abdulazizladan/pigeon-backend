import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDispenserDto } from './dto/create-dispenser.dto';
import { UpdateDispenserDto } from './dto/update-dispenser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispenser } from './entities/dispenser.entity';
import { Repository } from 'typeorm';
import { ApiNotFoundResponse } from '@nestjs/swagger';

@Injectable()
export class DispenserService {

  constructor(
    @InjectRepository(Dispenser)
    private readonly dispenserRepository: Repository<Dispenser>
  ) {

  }
  async create(createDispenserDto: CreateDispenserDto) {
    try { 
      const dispenser =  await this.dispenserRepository.create(createDispenserDto)
      await this.dispenserRepository.save(dispenser)
      return {
        success: true,
        data: createDispenserDto,
        message: "Dispenser added successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async getSummary() {
    const totalDispensers = await this.dispenserRepository.count()
    const activeDispensers = await this.dispenserRepository.count({where: {status: "active"}})
    const inactiveDispensers = await this.dispenserRepository.count({where: {status: "inactive"}})
    return {
      success: true,
      data: {
        total: totalDispensers,
        active: activeDispensers,
        inactive: inactiveDispensers
      },
      message: "Dispenser stats found"
    }
  }

  async findAll() {
    const dispensers = await this.dispenserRepository.find()
    try {
      if(dispensers.length != 0){
        return {
          success: true, 
          data: dispensers,
          message: "dispensers fetched successfully"
        }
      }else {
        return {
          success: true,
          data: null,
          message: "no dispensers found"
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async findOne(id: number) {
    const dispenser = await this.dispenserRepository.findOne({where: { id: id }, relations: ['sales']})
    try {
      if(dispenser){
        return {
          success: true, 
          data: dispenser,
          message: "dispenser fetched successfully"
        }
      }else {
        throw new NotFoundException();
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async update(id: number, updateDispenserDto: UpdateDispenserDto) {
    try {
      await this.dispenserRepository.update(id, updateDispenserDto)
      return {
        success: true,
        data: updateDispenserDto,
        message: "Dispenser updated successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  remove(id: number) {
    try {
      this.dispenserRepository.delete(id)
      return {
        success: true,
        message: "Dispenser deleted successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
