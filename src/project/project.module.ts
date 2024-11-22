import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaClient } from '@prisma/client';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService, PrismaClient],
})
export class ProjectModule {}
