import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrowseService } from './browse.service';
import { ListQueryDto } from './dto/list-query.dto';
import { Service as Svc } from '../service/entities/service.entity';
import { Category } from '../category/entities/category.entity';

@ApiTags('Browse')
@Controller('browse')
export class BrowseController {
  constructor(
    private readonly browse: BrowseService,
    @InjectRepository(Svc) private readonly svcRepo: Repository<Svc>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
  ) {}

  /** GET /browse/services */
  @Get('services')
  @ApiOperation({
    summary: 'Simple services search',
    description:
      'Partial search with exact-match priority on title/description. Alphabetically sorted by title. Paginated. No additional filters.',
  })
  @ApiOkResponse({ description: 'OK' })
  @ApiQuery({ name: 'q', required: false, description: 'Texto a buscar (title/description)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async browseServices(@Query() dto: ListQueryDto) {
    return this.browse.simpleSearch<Svc>({
      repo: this.svcRepo,
      alias: 'svc',
      dto,
      searchable: ['title', 'description'] as any,
      sortColumn: 'svc.title',
    });
  }

  /** GET /browse/categories */
  @Get('categories')
  @ApiOperation({
    summary: 'Simple categories search',
    description:
      'Partial search with exact-match priority on name/description. Alphabetically sorted by name. Paginated. No additional filters.',
  })
  @ApiOkResponse({ description: 'OK' })
  @ApiQuery({ name: 'q', required: false, description: 'Texto a buscar (name/description)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async browseCategories(@Query() dto: ListQueryDto) {
    return this.browse.simpleSearch<Category>({
      repo: this.catRepo,
      alias: 'cat',
      dto,
      searchable: ['name', 'description'] as any,
      sortColumn: 'cat.name',
    });
  }
}