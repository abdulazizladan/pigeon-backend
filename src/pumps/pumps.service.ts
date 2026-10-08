import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pump } from './entities/pump.entity';
import { PumpStatus } from './pump-status.enum';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { Product } from '../products/product.enum';
import { StationsService } from '../stations/stations.service';

/** Default layout seeded for every station in development: two petrol pumps, one diesel, one kerosene. */
const SEED_PUMPS: { name: string; product: Product }[] = [
  { name: 'Pump 1', product: Product.PETROL },
  { name: 'Pump 2', product: Product.PETROL },
  { name: 'Pump 3', product: Product.DIESEL },
  { name: 'Pump 4', product: Product.KEROSENE },
];

@Injectable()
export class PumpsService implements OnModuleInit {
  constructor(
    @InjectRepository(Pump)
    private readonly pumpsRepository: Repository<Pump>,
    private readonly stationsService: StationsService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') return;
    if ((await this.pumpsRepository.count()) > 0) return;

    const stations = await this.stationsService.findAll();
    const rows = stations.flatMap((station) =>
      SEED_PUMPS.map((p) => ({ ...p, stationId: station.id, status: PumpStatus.ACTIVE })),
    );
    if (rows.length) await this.pumpsRepository.save(this.pumpsRepository.create(rows));
  }

  async findByStation(stationId: string): Promise<Pump[]> {
    await this.stationsService.findOne(stationId); // 404 if unknown
    return this.pumpsRepository.find({ where: { stationId }, order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Pump> {
    const pump = await this.pumpsRepository.findOne({ where: { id } });
    if (!pump) throw new NotFoundException(`Pump with id "${id}" not found`);
    return pump;
  }

  async create(stationId: string, dto: CreatePumpDto): Promise<Pump> {
    await this.stationsService.findOne(stationId);
    const name = dto.name.trim();
    await this.assertNameFree(stationId, name);
    return this.pumpsRepository.save(
      this.pumpsRepository.create({
        stationId,
        name,
        product: dto.product,
        status: dto.status ?? PumpStatus.ACTIVE,
      }),
    );
  }

  async update(id: string, dto: UpdatePumpDto): Promise<Pump> {
    const pump = await this.findOne(id);
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name !== pump.name) await this.assertNameFree(pump.stationId, name);
      pump.name = name;
    }
    if (dto.product !== undefined) pump.product = dto.product;
    if (dto.status !== undefined) pump.status = dto.status;
    return this.pumpsRepository.save(pump);
  }

  /**
   * Permanently removes a pump. Past readings keep their own copy of the pump's name and product,
   * so history is unaffected; the pump simply stops appearing in future daily records.
   */
  async remove(id: string): Promise<Pump> {
    const pump = await this.findOne(id);
    await this.pumpsRepository.delete({ id: pump.id });
    return pump;
  }

  private async assertNameFree(stationId: string, name: string) {
    if (await this.pumpsRepository.findOne({ where: { stationId, name } })) {
      throw new ConflictException(`This station already has a pump named "${name}"`);
    }
  }
}
