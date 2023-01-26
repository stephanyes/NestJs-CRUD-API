import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { JwtGuard } from 'auth/guard';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      validatorPackage: require('class-validator'),
      whitelist: true, // this will strip out the elements that are not defined in our DTO
      transformerPackage: require('class-transformer'),
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // const reflector = new Reflector()
  // app.useGlobalGuards(new JwtGuard(reflector)); check appModule.ts providers
  await app.listen(3000);
}
bootstrap();
