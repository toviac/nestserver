import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './create-cat.dto';
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

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    return createCatDto;
  }
}
