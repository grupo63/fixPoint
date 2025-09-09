import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Configuración de validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Habilitar CORS para permitir conexión del frontend
  app.enableCors({
    origin: 'http://localhost:3000', // URL del front
    credentials: true,
  });

  // ✅ Configuración Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('fixpoint')
    .setDescription('Built with nest.js')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // ✅ Levantar el servidor
  // Elimina usuarios con password null antes de migrar
  const dataSource = app.get(DataSource);
  // await dataSource.query(`DELETE FROM "USERS" WHERE "password" IS NULL`);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
