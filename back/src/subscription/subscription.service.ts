// import { Injectable } from '@nestjs/common';
// import { CreateSubscriptionDto } from './dto/create-subscription.dto';
// import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
// import { SubscriptionRepository } from './subscription.repository';

// @Injectable()
// export class SubscriptionService {
//   constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

//   createSubscription(createSub: CreateSubscriptionDto) {
//     return this.subscriptionRepo.createSubscription(createSub);
//   }

//   getSubscriptions(page: number, limit: number) {
//     return this.subscriptionRepo.getSubscriptions(page, limit);
//   }

//   findById(subscriptionId: string) {
//     return this.subscriptionRepo.findById(subscriptionId);
//   }

//   findActiveByUserId(userId: string) {
//     return this.subscriptionRepo.findActiveByUserId(userId);
//   }

//   findAllActive() {
//     return this.subscriptionRepo.findAllActive();
//   }

//   cancelSubscription(subscriptionId: string) {
//     return this.subscriptionRepo.cancelSubscription(subscriptionId);
//   }

//   activateSubscription(subscriptionId: string) {
//     return this.subscriptionRepo.activateSubscription(subscriptionId);
//   }

//   getSubStats(userId: string) {
//     return this.subscriptionRepo.getSubStats(userId);
//   }

//   getAllSubStats() {
//     return this.subscriptionRepo.getAllSubStats();
//   }
// }
