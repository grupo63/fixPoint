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
import { ServiceModule } from './service/service.module';
import { UploadImgModule } from './upload-img/upload-img.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    ServiceModule,
    UploadImgModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
