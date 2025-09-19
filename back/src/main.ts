import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser'; // ✅ default import

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // ✅ Middleware temporal para loguear Authorization
  app.use((req, res, next) => {
    
    next();
  });

  // ✅ Cookies
  app.use(cookieParser());

  // ✅ Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONT_URL || 'http://localhost:3000',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // ✅ Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('fixpoint')
    .setDescription('Built with nest.js')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // ✅ Server
  const dataSource = app.get(DataSource);
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
