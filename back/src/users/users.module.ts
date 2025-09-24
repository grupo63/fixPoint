// En: src/users/users.module.ts

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { config as dotenvConfig } from 'dotenv';
import { Subscription } from 'src/subscription/entities/subscription.entity';

// --- NUEVAS IMPORTACIONES ---
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Subscription]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    ConfigModule, // <-- 1. Le damos acceso a las variables de entorno
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    // --- 2. INSTRUCCIONES PARA CONSTRUIR STRIPE ---
    // Esto es un "proveedor". Le dice al módulo cómo crear la herramienta Stripe.
    {
      provide: 'STRIPE', // El nombre de la herramienta que pide el servicio
      useFactory: (configService: ConfigService) => {
        // La "receta" para construirla:
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
          throw new Error('STRIPE_SECRET_KEY no está definida en .env');
        }
        return new Stripe(stripeSecretKey, {
          apiVersion: '2025-08-27.basil',
        });
      },
      inject: [ConfigService], // Le decimos que necesita el ConfigService para la receta
    },
  ],
  exports: [UsersService, TypeOrmModule, UserRepository],
})
export class UsersModule {}