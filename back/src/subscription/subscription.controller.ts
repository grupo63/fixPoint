// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Query,
//   Put,
//   ParseUUIDPipe,
//   UseGuards,
//   Req,
// } from '@nestjs/common';
// import { SubscriptionService } from './subscription.service';
// import { CreateSubscriptionDto } from './dto/create-subscription.dto';
// import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
// import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guards';
// import { RolesGuard } from 'src/auth/guards/roles.guards';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { TemporaryRole } from 'src/users/types/temporary-role';

// @Controller('subscription')
// export class SubscriptionController {
//   constructor(private readonly subscriptionService: SubscriptionService) {}

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Create a new subscription',
//     description: 'Create a new subscription with all its info',
//   })
//   @UseGuards(JwtAuthGuard)
//   @Post()
//   create(@Body() createSubDto: CreateSubscriptionDto) {
//     return this.subscriptionService.createSubscription(createSubDto);
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Get all subscriptions',
//     description: 'Retrieve a paginated list of subscriptions',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Get()
//   getSubscriptions(@Query('page') page: number, @Query('limit') limit: number) {
//     if (page && limit)
//       return this.subscriptionService.getSubscriptions(
//         Number(page),
//         Number(limit),
//       );
//     return this.subscriptionService.getSubscriptions(1, 10);
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Get all active subscriptions',
//     description: 'Retrieve all active subscriptions in the system',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Get('all-active')
//   getAllActive() {
//     return this.subscriptionService.findAllActive();
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Get subscription by ID',
//     description: 'Retreieve an specific subscription by userId',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Get(':id')
//   findSubById(@Param('id', ParseUUIDPipe) id: string) {
//     return this.subscriptionService.findById(id);
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Get active subscription for a single user',
//     description: 'Retreieve an specific subscription by userId',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Get(':id/active')
//   findActiveSub(@Param('id', ParseUUIDPipe) id: string) {
//     return this.subscriptionService.findActiveByUserId(id);
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Activate subscription',
//     description: 'Reactivate a desactivated subscription',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Put(':id/activate')
//   activateSub(@Param('id', ParseUUIDPipe) id: string) {
//     return this.subscriptionService.activateSubscription(id);
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Deactivate subscription',
//     description: 'Cancel an active subscription',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Put(':id/cancel')
//   cancelSub(@Param('id', ParseUUIDPipe) id: string) {
//     return this.subscriptionService.cancelSubscription(id);
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Get all subscription stats',
//     description: 'Retrieve overall statistics for all subscriptions',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Get('stats/all')
//   getAllStats() {
//     return this.subscriptionService.getAllSubStats();
//   }

//   @ApiBearerAuth()
//   @ApiOperation({
//     summary: 'Get subs stats',
//     description: 'Retreieve subscription stadistics',
//   })
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(TemporaryRole.ADMIN)
//   @Get(':id/stats')
//   getStats(@Query('id', ParseUUIDPipe) userId: string) {
//     return this.subscriptionService.getSubStats(userId);
//   }
// }
