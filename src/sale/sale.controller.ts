import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
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
   * Create a new sale.
   * Accessible by manager only.
   * @access manager
   * @param createSaleDto - DTO containing sale details
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: 'Create a new sale', description: 'Create a new sale' })
  @ApiOkResponse({ description: 'Sale created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  /**
   * Get all sales.
   * Accessible by director and manager.
   * @access director, manager
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get all sales', description: 'Get all sales' })
  @ApiOkResponse({ description: 'All sales retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Get()
  findAll() {
    return this.saleService.findAll();
  }

  /**
   * Get a sale by ID.
   * Accessible by director and manager.
   * @access director, manager
   * @param id - The ID of the sale
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get a sale by id', description: 'Get a sale by id' })
  @ApiOkResponse({ description: 'Sale retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleService.findOne(+id);
  }

  /**
   * Update a sale by ID.
   * Accessible by manager only.
   * @access manager
   * @param id - The ID of the sale
   * @param updateSaleDto - DTO containing updated sale data
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: 'Update a sale', description: 'Update a sale' })
  @ApiOkResponse({ description: 'Sale updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(+id, updateSaleDto);
  }

  /**
   * Delete a sale by ID.
   * Accessible by manager only.
   * @access manager
   * @param id - The ID of the sale
   */
  /**
  @Roles(Role.manager)
  @ApiOperation({ summary: 'Delete a sale', description: 'Delete a sale' })
  @ApiOkResponse({ description: 'Sale deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saleService.remove(+id);
  }
  **/
}
