import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Dispenser } from 'src/dispenser/entities/dispenser.entity';

@Injectable()
export class SaleService {

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Dispenser)
    private readonly dispenserRepository: Repository<Dispenser>
  ) {}

  /**
   * Create a new sale record.
   * @param createSaleDto - DTO containing sale details
   * @returns Success response with created sale
   */
  async create(createSaleDto: CreateSaleDto) {
    try {
      // Find the dispenser for the relation
      const dispenser = await this.dispenserRepository.findOne({ where: { id: createSaleDto.dispenserId } });
      if (!dispenser) {
        throw new NotFoundException('Dispenser not found');
      }
      // Create and save the sale
      const sale = this.saleRepository.create({ ...createSaleDto, dispenser });
      const savedSale = await this.saleRepository.save(sale);
      return {
        success: true,
        data: savedSale,
        message: 'Sale created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get all sales records.
   * @returns Success response with all sales
   */
  async findAll() {
    try {
      const sales = await this.saleRepository.find({ relations: ['dispenser', 'station'] });
      if (sales.length > 0) {
        return {
          success: true,
          data: sales,
          message: 'Sales records found',
        };
      } else {
        return {
          success: true,
          data: [],
          message: 'No sales records found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get a single sale by ID.
   * @param id - The ID of the sale
   * @returns Success response with sale or error if not found
   */
  async findOne(id: number) {
    try {
      const sale = await this.saleRepository.findOne({
        where: { id },
        relations: ['dispenser', 'station'],
      });
      if (sale) {
        return {
          success: true,
          data: sale,
          message: 'Sales record found',
        };
      } else {
        throw new NotFoundException('Sales record not found');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Update a sale by ID.
   * @param id - The ID of the sale
   * @param updateSaleDto - DTO containing updated sale data
   * @returns Success or error response
   */
  async update(id: number, updateSaleDto: UpdateSaleDto) {
    try {
      const sale = await this.saleRepository.findOne({ where: { id } });
      if (!sale) {
        throw new NotFoundException('Sale not found');
      }
      await this.saleRepository.update({ id }, updateSaleDto);
      const updatedSale = await this.saleRepository.findOne({ where: { id }, relations: ['dispenser', 'station'] });
      return {
        success: true,
        data: updatedSale,
        message: 'Sale updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Delete a sale by ID.
   * @param id - The ID of the sale
   * @returns Success or error response
   */
  async remove(id: number) {
    try {
      const sale = await this.saleRepository.findOne({ where: { id } });
      if (!sale) {
        throw new NotFoundException('Sale not found');
      }
      await this.saleRepository.delete({ id });
      return {
        success: true,
        message: 'Sale deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
