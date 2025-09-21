import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/typeorm';
import { DataSourceOptions } from 'typeorm';
import { ProfessionalModule } from './professional/professional.module';
import { UsersModule } from './users/users.module';
import { AvailableModule } from './available/available.module';
import { CategoryModule } from './category/category.module';
import { ReservationModule } from './reservation/reservation.module';
import { ServiceModule } from './service/service.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UploadImgModule } from './upload-img/upload-img.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BrowseModule } from './browse/browse.module';
import { AdminModule } from './admin/admin.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentsModule } from './payments/payments.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { InboxModule } from './inbox/inbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DataSourceOptions => {
        return configService.get<DataSourceOptions>('typeorm')!;
      },
    }),
    ProfessionalModule,
    UsersModule,
    AvailableModule,
    CategoryModule,
    ReservationModule,
    ServiceModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    UploadImgModule,
    ReviewsModule,
    BrowseModule,
    AdminModule,
    SubscriptionModule,
    PaymentsModule,
    ChatbotModule,
    InboxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
