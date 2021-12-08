import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}
  async search(q: string) {
    return this.stockRepository.find({
      where: {
        name: Like(`${q}%`),
      },
      order: {
        marketCap: 'DESC',
      },
      take: 20,
    });
  }
}
