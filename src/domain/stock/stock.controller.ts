import { Controller, Get, Query } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('/search')
  findAll(@Query('q') q: string) {
    return this.stockService.search(q);
  }
}
