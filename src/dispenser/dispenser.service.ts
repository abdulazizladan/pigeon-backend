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
    // The dispenserRepository is injected to interact with the Dispenser entity in the database
  }

  /**
   * Creates a new dispenser record in the database.
   * @param createDispenserDto - Data Transfer Object containing dispenser details
   * @returns Success or error response with message
   */
  async create(createDispenserDto: CreateDispenserDto) {
    try { 
      // Create and save a new dispenser entity
      const dispenser =  await this.dispenserRepository.create(createDispenserDto)
      await this.dispenserRepository.save(dispenser)
      return {
        success: true,
        data: createDispenserDto,
        message: "Dispenser added successfully"
      }
    } catch (error) {
      // Return error message if creation fails
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Retrieves a summary of dispenser statistics (total, active, inactive).
   * @returns Object containing dispenser stats
   */
  async getSummary() {
    // Count total, active, and inactive dispensers
    const totalDispensers = await this.dispenserRepository.count()
    const activeDispensers = await this.dispenserRepository.count({ where: { status: 'active' as any } })
    const inactiveDispensers = await this.dispenserRepository.count({ where: { status: 'inactive' as any } })
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

  /**
   * Fetches all dispenser records from the database.
   * @returns Success response with dispensers or message if none found
   */
  async findAll() {
    // Retrieve all dispensers
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
      // Return error message if fetching fails
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Fetches a single dispenser by its ID, including its sales relation.
   * @param id - The ID of the dispenser to fetch
   * @returns Success response with dispenser or error if not found
   */
  async findOne(id: string) {
    // Find dispenser by ID with related sales
    const dispenser = await this.dispenserRepository.findOne(
      {
        where: 
        { 
          id: id 
        }, 
        relations: 
        [
          'sales'
        ]
      }
    )
    try {
      if(dispenser){
        return {
          success: true, 
          data: dispenser,
          message: "dispenser fetched successfully"
        }
      }else {
        // Throw NotFoundException if dispenser does not exist
        throw new NotFoundException();
      }
    } catch (error) {
      // Return error message if fetching fails
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Updates a dispenser record by its ID.
   * @param id - The ID of the dispenser to update
   * @param updateDispenserDto - DTO containing updated dispenser data
   * @returns Success or error response with message
   */
  async update(id: string, updateDispenserDto: UpdateDispenserDto) {
    try {
      // Update dispenser with new data
      await this.dispenserRepository.update(id, updateDispenserDto)
      return {
        success: true,
        data: updateDispenserDto,
        message: "Dispenser updated successfully"
      }
    } catch (error) {
      // Return error message if update fails
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Deletes a dispenser record by its ID.
   * @param id - The ID of the dispenser to delete
   * @returns Success or error response with message
   */
  remove(id: string) {
    try {
      // Delete dispenser by ID
      this.dispenserRepository.delete(id)
      return {
        success: true,
        message: "Dispenser deleted successfully"
      }
    } catch (error) {
      // Return error message if deletion fails
      return {
        success: false,
        message: error.message
      }
    }
  }
}
