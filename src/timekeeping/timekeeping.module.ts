import { Module } from '@nestjs/common';
import { TimekeepingService } from './timekeeping.service';
import { TimekeepingController } from './timekeeping.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [TimekeepingController],
  providers: [TimekeepingService, PrismaClient],
})
export class TimekeepingModule {}
