import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { JwtGuard } from 'auth/guard';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this will strip out the elements that are not defined in our DTO
    }),
  );
  // const reflector = new Reflector()
  // app.useGlobalGuards(new JwtGuard(reflector)); check appModule.ts providers
  await app.listen(3000);
}
bootstrap();
