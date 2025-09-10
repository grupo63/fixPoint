import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { User } from 'src/users/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { Professional } from 'src/professional/entity/professional.entity';

@Module({

  
  imports: [
    TypeOrmModule.forFeature([User, Professional]),
    ConfigModule,
    PassportModule.register({ session: false }), // [ADD]
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') ?? '60m' },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, GoogleStrategy], // [ADD]
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
