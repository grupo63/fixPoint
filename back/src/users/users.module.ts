import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { config as dotenvConfig } from 'dotenv';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Importado
import Stripe from 'stripe'; // <-- Importado

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Subscription]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    ConfigModule, // <-- Añadido para acceder a variables de entorno
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    // --- Proveedor de Stripe Añadido y Corregido ---
    {
      provide: 'STRIPE',
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');
        // --- Comprobación de Seguridad Añadida ---
        if (!stripeSecretKey) {
          throw new Error(
            'STRIPE_SECRET_KEY no está definida en las variables de entorno.',
          );
        }
        return new Stripe(stripeSecretKey, {
          apiVersion: '2025-08-27.basil',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [UsersService, TypeOrmModule, UserRepository],
})
export class UsersModule {}