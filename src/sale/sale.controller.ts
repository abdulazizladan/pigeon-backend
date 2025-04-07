import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Sale')
@ApiBearerAuth()
@Controller('sale')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SaleController {
  
  constructor(private readonly saleService: SaleService) {}

  /**
   * 
   * @param createSaleDto 
   * @returns 
   */
  @Roles(Role.manager)
  @ApiOperation(
    {
      summary: 'Create a new sale',
      description: 'Create a new sale',
    }
  )
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  /**
   * 
   * @returns 
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation(
    {
      summary: 'Get all sales',
      description: 'Get all sales',
    }
  )
  @Get()
  findAll() {
    return this.saleService.findAll();
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation(
    {
      summary: 'Get a sale by id',
      description: 'Get a sale by id',
    }
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(+id);
  }

  /**
   * 
   * @param id 
   * @param updateSaleDto 
   * @returns 
   */
  @Roles(Role.manager)
  @ApiOperation(
    {
      summary: 'Update a sale',
      description: 'Update a sale',
    }
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(+id, updateSaleDto);
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  /** 
  @ApiOperation(
    {
      summary: 'Delete a sale',
      description: 'Delete a sale',
    }
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleService.remove(+id);
  }
    **/
}
