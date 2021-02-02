import { Controller, Get, Param } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private castService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.castService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id): string {
    return `params.id: ${id}`;
  }
}
