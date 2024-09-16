import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaClient } from '@prisma/client';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaClient],
})
export class EmployeeModule {}
