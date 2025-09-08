import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './reviews.service';
import { ReviewDto } from './dto/review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Creates a new review' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The review has been successfully created.',
    type: ReviewDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or reservation not completed.',
  })
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieves all reviews' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A list of all reviews.',
    type: [ReviewDto],
  })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieves a single review by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the review.',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The review was found successfully.',
    type: ReviewDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates an existing review' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the review.',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: ReviewDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The review has been successfully updated.',
    type: ReviewDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found.',
  })
  update(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body() updateReviewDto: ReviewDto,
  ) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes a review' })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the review to delete.',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The review has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
