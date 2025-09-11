import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { BrowseService } from './browse.service';
import { ListQueryDto } from './dto/list-query.dto';
import { Paginated } from './types/paginated.type';
import { Service as Svc } from '../service/entities/service.entity';
import { Category } from '../category/entities/category.entity';

@ApiTags('Browse')
@Controller('browse')
export class BrowseController {
  constructor(private readonly browseService: BrowseService) {}

  /**
   * GET /browse/services
   * Search + filters for Services
   */
  @Get('services')
  @ApiOperation({
    summary: 'Browse services with search and filters',
    description:
      'Returns a paginated list of services, applying optional text search and filters (category, status, price range, etc.).',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, example: 'plumber' })
  @ApiQuery({ name: 'categoryId', required: false, example: 'uuid-category' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiQuery({ name: 'minPrice', required: false, example: 50 })
  @ApiQuery({ name: 'maxPrice', required: false, example: 200 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'price' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @ApiOkResponse({
    description: 'Paginated list of services',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 42 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'e46e9e9e-1234-4321-aaaa-abcdef123456' },
              title: { type: 'string', example: 'Plumbing fix' },
              description: { type: 'string', example: 'Leak repair and pipe replacement' },
              price: { type: 'number', example: 120 },
              isActive: { type: 'boolean', example: true },
              categoryId: { type: 'string', example: 'uuid-category' },
            },
          },
        },
      },
      example: {
        total: 42,
        page: 1,
        limit: 10,
        totalPages: 5,
        data: [
          {
            id: 'e46e9e9e-1234-4321-aaaa-abcdef123456',
            title: 'Plumbing fix',
            description: 'Leak repair and pipe replacement',
            price: 120,
            isActive: true,
            categoryId: '1d3b2c4a-aaaa-bbbb-cccc-1234567890ab',
          },
        ],
      },
    },
  })
  async services(
    @Query() query: ListQueryDto,
  ): Promise<Paginated<Svc>> {
    return this.browseService.listServices(query);
  }

  /**
   * GET /browse/categories
   * Search + filters for Categories
   */
  @Get('categories')
  @ApiOperation({
    summary: 'Browse categories with search and filters',
    description:
      'Returns a paginated list of categories, applying optional text search and filters (status).',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, example: 'plumbing' })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @ApiQuery({ name: 'sortBy', required: false, example: 'name' })
  @ApiQuery({ name: 'order', required: false, example: 'ASC' })
  @ApiOkResponse({
    description: 'Paginated list of categories',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 12 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 2 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '2b8ccf5e-9876-5432-bbbb-abcdef654321' },
              name: { type: 'string', example: 'Plumbing' },
              description: { type: 'string', example: 'Pipes, leaks and repairs' },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
      },
      example: {
        total: 12,
        page: 1,
        limit: 10,
        totalPages: 2,
        data: [
          {
            id: '2b8ccf5e-9876-5432-bbbb-abcdef654321',
            name: 'Plumbing',
            description: 'Pipes, leaks and repairs',
            isActive: true,
          },
        ],
      },
    },
  })
  async categories(
    @Query() query: ListQueryDto,
  ): Promise<Paginated<Category>> {
    return this.browseService.listCategories(query);
  }
}