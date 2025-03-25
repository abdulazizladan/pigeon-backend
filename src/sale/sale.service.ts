import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SaleService {

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>
  ) {}

  /**
   * 
   * @param createSaleDto 
   */
  async create(createSaleDto: CreateSaleDto) {
    const data = await this.saleRepository.create(createSaleDto)
    const dispenerData = await this.saleRepository.findOne({where: {id: createSaleDto.dispenserId}})
    return this.saleRepository.save({
      ...data,
      dispenser: dispenerData
    })
    }

  /**
   * 
   * @returns 
   */
  async findAll() {
    const sales = await this.saleRepository.find({})
    try {
      if(sales.length > 0) {
        return {
          success: true,
          data: sales, 
          message: "Sales records found"
        }
      }else {
        return {
          success: true,
          data: null,
          message: "No sales records found"
        }
      }
    } catch(error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  async findOne(id: number) {
    const sale = await this.saleRepository.findOne(
      {
        where: {id}, 
        relations: 
        [
          'dispenser', 
          'station'
        ]
      }
    )
    try {
      if(sale) {
        return {
          success: true, 
          data: sale,
          message: "Sales record found"
        }
      }else {
        throw new NotFoundException('Sales record not found')
      }
    } catch(error) {
      return {
        success: false, 
        message: error.message
      }
    }
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    try {
      const sale = this.saleRepository.update({id}, updateSaleDto)
      return {
        success: true,
        message: 'Sale updated successfully'
      }
    } catch(error) {
      return {
        success: false,
        message: error.message  
      }
    }
  }

  remove(id: number) {
try {
  this.saleRepository.delete({id})
  return {
    success: true,
    message: 'Sale deleted successfully'  
    } }
    catch(error) {
      return {
        success: false,
        message: error.message
      }
    }  
  }
}
