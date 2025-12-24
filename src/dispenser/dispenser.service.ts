import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
      const dispenser = this.dispenserRepository.create(createDispenserDto)
      return await this.dispenserRepository.save(dispenser)
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a summary of dispenser statistics (total, active, inactive).
   * @returns Object containing dispenser stats
   */
  async getSummary() {
    try {
      // Count total, active, and inactive dispensers
      const totalDispensers = await this.dispenserRepository.count()
      const activeDispensers = await this.dispenserRepository.count({ where: { status: 'active' as any } })
      const inactiveDispensers = await this.dispenserRepository.count({ where: { status: 'inactive' as any } })
      return {
        total: totalDispensers,
        active: activeDispensers,
        inactive: inactiveDispensers
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Fetches all dispenser records from the database.
   * @returns Success response with dispensers or message if none found
   */
  async findAll() {
    // Retrieve all dispensers
    const dispensers = await this.dispenserRepository.find({
      relations: {
        station: true
      }
    })
    try {
      return dispensers;
    } catch (error) {
      // Return error message if fetching fails
      throw new InternalServerErrorException(error.message);
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
        relations: {
          sales: true
        }
      }
    )

    if (!dispenser) {
      throw new NotFoundException(`Dispenser with ID ${id} not found`);
    }
    return dispenser;
  }

  /**
   * Updates a dispenser record by its ID.
   * @param id - The ID of the dispenser to update
   * @param updateDispenserDto - DTO containing updated dispenser data
   * @returns Success or error response with message
   */
  async update(id: string, updateDispenserDto: UpdateDispenserDto) {
    // Update dispenser with new data
    const result = await this.dispenserRepository.update(id, updateDispenserDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Dispenser with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  /**
   * Deletes a dispenser record by its ID.
   * @param id - The ID of the dispenser to delete
   * @returns Success or error response with message
   */
  async remove(id: string) {
    // Delete dispenser by ID
    const result = await this.dispenserRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dispenser with ID ${id} not found`);
    }
    return {
      success: true,
      message: "Dispenser deleted successfully"
    }
  }
}
