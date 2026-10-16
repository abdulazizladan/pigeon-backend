import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservoir } from './entities/reservoir.entity';
import { CreateReservoirDto } from './dto/create-reservoir.dto';
import { UpdateReservoirDto } from './dto/update-reservoir.dto';
import { Product, PRODUCTS } from '../products/product.enum';
import { StationsService } from '../stations/stations.service';
import { shouldSeedDemoData } from '../common/seed.util';

/** Tank sizes seeded for every station in development. */
const SEED_CAPACITY: Record<Product, number> = {
  [Product.PETROL]: 33000,
  [Product.DIESEL]: 20000,
  [Product.KEROSENE]: 10000,
};

@Injectable()
export class ReservoirsService implements OnModuleInit {
  constructor(
    @InjectRepository(Reservoir)
    private readonly reservoirsRepository: Repository<Reservoir>,
    private readonly stationsService: StationsService,
  ) {}

  async onModuleInit() {
    if (!shouldSeedDemoData()) return;
    if ((await this.reservoirsRepository.count()) > 0) return;

    const stations = await this.stationsService.findAll();
    const rows = stations.flatMap((station) =>
      PRODUCTS.map((product) => ({ stationId: station.id, product, capacityLitres: SEED_CAPACITY[product] })),
    );
    if (rows.length) await this.reservoirsRepository.save(this.reservoirsRepository.create(rows));
  }

  async findByStation(stationId: string): Promise<Reservoir[]> {
    await this.stationsService.findOne(stationId); // 404 if unknown
    return this.reservoirsRepository.find({ where: { stationId }, order: { product: 'ASC' } });
  }

  async findOne(id: string): Promise<Reservoir> {
    const reservoir = await this.reservoirsRepository.findOne({ where: { id } });
    if (!reservoir) throw new NotFoundException(`Reservoir with id "${id}" not found`);
    return reservoir;
  }

  async create(stationId: string, dto: CreateReservoirDto): Promise<Reservoir> {
    await this.stationsService.findOne(stationId);
    if (await this.reservoirsRepository.findOne({ where: { stationId, product: dto.product } })) {
      throw new ConflictException(`This station already has a ${dto.product} reservoir`);
    }
    return this.reservoirsRepository.save(
      this.reservoirsRepository.create({ stationId, product: dto.product, capacityLitres: dto.capacityLitres }),
    );
  }

  async update(id: string, dto: UpdateReservoirDto): Promise<Reservoir> {
    const reservoir = await this.findOne(id);
    if (dto.capacityLitres !== undefined) reservoir.capacityLitres = dto.capacityLitres;
    return this.reservoirsRepository.save(reservoir);
  }
}
