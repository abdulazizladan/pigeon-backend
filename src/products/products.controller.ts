import { Body, Controller, Get, Param, ParseEnumPipe, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SetPriceDto } from './dto/set-price.dto';
import { Product, PRODUCT_LABELS, PRODUCTS } from './product.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { JwtPayload } from '../auth/auth.service';
import { LogActivity } from '../activities/activity.decorator';

@ApiTags('Products & Prices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  @ApiOperation({ summary: 'The products every station sells' })
  list() {
    return PRODUCTS.map((value) => ({ value, label: PRODUCT_LABELS[value] }));
  }

  @Get('stations/:stationId/prices')
  @ApiOperation({ summary: 'Current ₦/litre for each product at a station' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findByStation(@Param('stationId') stationId: string) {
    return this.productsService.findByStation(stationId);
  }

  @Put('stations/:stationId/prices/:product')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @LogActivity({
    action: 'price.set',
    describe: ({ result }) => `Set ${PRODUCT_LABELS[result.product as Product] ?? result.product} price to ₦${result.pricePerLitre}/L`,
    target: ({ params }) => ({ type: 'station', id: params.stationId ?? null, label: null }),
    metadata: ({ result }) => ({ product: result.product, pricePerLitre: result.pricePerLitre }),
  })
  @ApiOperation({ summary: 'Set the ₦/litre of a product at a station. Admin and Director only.' })
  @ApiParam({ name: 'product', enum: PRODUCTS })
  @ApiResponse({ status: 404, description: 'Station not found' })
  setPrice(
    @Param('stationId') stationId: string,
    @Param('product', new ParseEnumPipe(Product)) product: Product,
    @Body() dto: SetPriceDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.productsService.setPrice(stationId, product, dto.pricePerLitre, req.user);
  }
}
