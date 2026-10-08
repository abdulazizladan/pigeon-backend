import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StationProductPrice } from './entities/station-product-price.entity';
import { Product, PRODUCTS } from './product.enum';
import { StationsService } from '../stations/stations.service';
import { JwtPayload } from '../auth/auth.service';

/** Default ₦/litre used to seed stations in development. */
const SEED_PRICES: Record<Product, number> = {
  [Product.PETROL]: 880,
  [Product.DIESEL]: 1150,
  [Product.KEROSENE]: 1600,
};

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(StationProductPrice)
    private readonly pricesRepository: Repository<StationProductPrice>,
    private readonly stationsService: StationsService,
  ) {}

  /** Gives every station a price for every product in non-production so the sales form works out of the box. */
  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') return;
    if ((await this.pricesRepository.count()) > 0) return;

    const stations = await this.stationsService.findAll();
    const rows: Partial<StationProductPrice>[] = [];
    for (const [index, station] of stations.entries()) {
      for (const product of PRODUCTS) {
        rows.push({
          stationId: station.id,
          product,
          // Small per-station spread so dashboards don't show identical numbers everywhere.
          pricePerLitre: SEED_PRICES[product] + (index % 3) * 10,
          updatedById: null,
          updatedByUsername: null,
        });
      }
    }
    if (rows.length) await this.pricesRepository.save(this.pricesRepository.create(rows));
  }

  /** Prices for one station, one entry per product; products with no price yet come back as null. */
  async findByStation(stationId: string): Promise<{ product: Product; pricePerLitre: number | null; updatedAt: Date | null }[]> {
    await this.stationsService.findOne(stationId); // 404 if unknown
    const rows = await this.pricesRepository.find({ where: { stationId } });
    const byProduct = new Map(rows.map((r) => [r.product, r]));
    return PRODUCTS.map((product) => {
      const row = byProduct.get(product);
      return { product, pricePerLitre: row?.pricePerLitre ?? null, updatedAt: row?.updatedAt ?? null };
    });
  }

  /** Current ₦/litre keyed by product. Products without a configured price are absent. */
  async priceMap(stationId: string): Promise<Map<Product, number>> {
    const rows = await this.pricesRepository.find({ where: { stationId } });
    return new Map(rows.map((r) => [r.product, r.pricePerLitre]));
  }

  async setPrice(stationId: string, product: Product, pricePerLitre: number, user: JwtPayload): Promise<StationProductPrice> {
    await this.stationsService.findOne(stationId); // 404 if unknown
    const existing = await this.pricesRepository.findOne({ where: { stationId, product } });
    const row = existing ?? this.pricesRepository.create({ stationId, product });
    row.pricePerLitre = Math.round(pricePerLitre * 100) / 100;
    row.updatedById = user.sub;
    row.updatedByUsername = user.username;
    return this.pricesRepository.save(row);
  }
}
