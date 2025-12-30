import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Supply, SupplyStatus, ProductType } from './entities/supply.entity';
import { Repository } from 'typeorm';
import { StationService } from 'src/station/station.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SupplyService {
  constructor(
    @InjectRepository(Supply)
    private readonly supplyRepository: Repository<Supply>,
    private readonly stationService: StationService, // Assuming StationService is exported and has findOne/update methods
    private readonly userService: UserService,
  ) { }

  async create(createSupplyDto: CreateSupplyDto, userId: string) {
    // Validate Station
    const station = await this.stationService.findOne(createSupplyDto.stationId);
    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // Validate User
    const user = await this.userService.findOne(userId); // Assuming findOne returns user via id/email or needs robust ID check
    // If UserService.findOne expects email, you might need a dedicated findById
    if (!user) {
      throw new NotFoundException('User not found'); // Ideally check for ID
    }

    try {
      const supply = this.supplyRepository.create({
        ...createSupplyDto,
        requestedBy: { id: userId } as any,
        station: { id: createSupplyDto.stationId } as any,
        currentPetrolLevel: createSupplyDto.currentPetrolLevel,
        currentDieselLevel: createSupplyDto.currentDieselLevel,
      });
      return await this.supplyRepository.save(supply);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    return this.supplyRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['station', 'requestedBy', 'approvedBy']
    });
  }

  async findAllByStation(stationId: string) {
    return this.supplyRepository.find({
      where: { stationId },
      order: { createdAt: 'DESC' },
      relations: ['requestedBy', 'approvedBy']
    });
  }

  async findOne(id: string) {
    const supply = await this.supplyRepository.findOne({
      where: { id },
      relations: ['station', 'requestedBy', 'approvedBy']
    });
    if (!supply) throw new NotFoundException('Supply request not found');
    return supply;
  }

  async updateStatus(id: string, updateSupplyDto: UpdateSupplyDto, approverId: string) {
    const supply = await this.findOne(id);
    const { status } = updateSupplyDto;

    // Prevent re-updating final states
    if (supply.status === SupplyStatus.DELIVERED || supply.status === SupplyStatus.REJECTED) {
      throw new BadRequestException(`Cannot update supply request that is already ${supply.status}`);
    }

    supply.status = status;
    supply.approvedBy = { id: approverId } as any;

    // 🏆 CRITICAL LOGIC: If Delivered, update station inventory
    if (status === SupplyStatus.DELIVERED) {
      supply.deliveryDate = new Date();

      // Update Station Inventory
      const station = await this.stationService.findOne(supply.stationId);

      // NOTE: StationService needs an update method or we do a direct repository update if we had access here.
      // Assuming we rely on StationService.update.

      // This logic mimics an inventory top-up.
      if (supply.product === ProductType.PETROL) {
        await this.stationService.update(station.id, { petrolVolume: Number(station.petrolVolume) + Number(supply.quantity) } as any);
      } else if (supply.product === ProductType.DIESEL) {
        await this.stationService.update(station.id, { dieselVolume: Number(station.dieselVolume) + Number(supply.quantity) } as any);
      }
    }

    return this.supplyRepository.save(supply);
  }

  // Reporting / Trends
  async getRefuelTrends(stationId?: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = this.supplyRepository.createQueryBuilder('supply')
      .select("DATE(supply.deliveryDate)", 'date')
      .addSelect("SUM(supply.quantity)", 'totalQuantity')
      .addSelect("supply.product", 'product')
      .where("supply.status = :status", { status: SupplyStatus.DELIVERED })
      .andWhere("supply.deliveryDate >= :startDate", { startDate });

    if (stationId) {
      query.andWhere("supply.stationId = :stationId", { stationId });
    }

    const results = await query
      .groupBy("DATE(supply.deliveryDate)")
      .addGroupBy("supply.product")
      .orderBy("date", "ASC")
      .getRawMany();

    return results.map(r => ({
      date: r.date,
      product: r.product,
      totalQuantity: parseFloat(r.totalQuantity)
    }));
  }


  async getLastRestock(stationId: string) {
    const lastPetrol = await this.supplyRepository.findOne({
      where: {
        stationId,
        product: ProductType.PETROL,
        status: SupplyStatus.DELIVERED
      },
      order: { deliveryDate: 'DESC' }
    });

    const lastDiesel = await this.supplyRepository.findOne({
      where: {
        stationId,
        product: ProductType.DIESEL,
        status: SupplyStatus.DELIVERED
      },
      order: { deliveryDate: 'DESC' }
    });

    return {
      petrol: lastPetrol ? { quantity: lastPetrol.quantity, date: lastPetrol.deliveryDate } : null,
      diesel: lastDiesel ? { quantity: lastDiesel.quantity, date: lastDiesel.deliveryDate } : null,
    };
  }
}

