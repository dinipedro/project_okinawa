import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CookStation } from '../entities/cook-station.entity';
import { CreateCookStationDto, UpdateCookStationDto } from '../dto/cook-station.dto';
import { KDS_MESSAGES } from '@/common/i18n/kds-brain.i18n';

@Injectable()
export class CookStationService {
  private readonly logger = new Logger(CookStationService.name);

  constructor(
    @InjectRepository(CookStation)
    private readonly cookStationRepository: Repository<CookStation>,
  ) {}

  async create(dto: CreateCookStationDto): Promise<CookStation> {
    const station = this.cookStationRepository.create(dto);
    const saved = await this.cookStationRepository.save(station);
    this.logger.log(`Station created: ${saved.id} for restaurant ${saved.restaurant_id}`);
    return saved;
  }

  async findByRestaurant(restaurantId: string): Promise<CookStation[]> {
    return this.cookStationRepository.find({
      where: { restaurant_id: restaurantId, is_active: true },
      order: { display_order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CookStation> {
    const station = await this.cookStationRepository.findOne({ where: { id } });
    if (!station) {
      throw new NotFoundException(KDS_MESSAGES.STATION_NOT_FOUND);
    }
    return station;
  }

  async update(id: string, dto: UpdateCookStationDto): Promise<CookStation> {
    const station = await this.findOne(id);
    Object.assign(station, dto);
    const updated = await this.cookStationRepository.save(station);
    this.logger.log(`Station updated: ${updated.id}`);
    return updated;
  }

  async remove(id: string): Promise<CookStation> {
    const station = await this.findOne(id);
    station.is_active = false;
    const deactivated = await this.cookStationRepository.save(station);
    this.logger.log(`Station soft-deleted: ${deactivated.id}`);
    return deactivated;
  }
}
