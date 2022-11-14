import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Nest js Magic
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
