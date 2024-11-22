import { Body, Controller, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { TimekeepingService } from './timekeeping.service';
import { ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';

@ApiTags('Timekeeping')
@Controller('timekeeping')
export class TimekeepingController {
  private prisma: PrismaClient;

  constructor(private readonly timekeepingService: TimekeepingService) {
    this.prisma = new PrismaClient();
  }

  @Put('register-face')
  async registerFace(@Body() body) {
    const { employee_id, embeddings } = body;
    const employeeId = parseInt(employee_id);

    // Kiểm tra nhân viên có tồn tại không
    const user = await this.prisma.employees.findFirst({
      where: {
        employee_id: employeeId,
      },
    });

    if (user) {
      return this.timekeepingService.registerFace(employeeId, embeddings);
    } else {
      return {
        message: 'Employee not found',
        statusCode: HttpStatus.NOT_FOUND,
      };
    }
  }

  @Post('check-In/:employee_id')
  async clockInTimeKeeping(
    @Param('employee_id') employee_id: number,
    @Body() body,
  ) {
    const { embeddings } = body;
    return this.timekeepingService.clockInTimeKeeping(employee_id, embeddings);
  }

  @Put('check-Out/:employee_id')
  async clockOutTimeKeeping(
    @Param('employee_id') employee_id: number,
    @Body() body,
  ) {
    const { embeddings } = body;
    return this.timekeepingService.clockOutTimeKeeping(employee_id, embeddings);
  }

  @Get('check-Timekeeping/:employee_id')
  async checkTimekeeping(@Param('employee_id') employee_id: number) {
    return this.timekeepingService.checkTimekeeping(employee_id);
  }

  @Get('total-timekeeping/:employee_id')
  async getTotalTimekeeping(@Param('employee_id') employee_id: number) {
    return this.timekeepingService.getTotalTimekeeping(employee_id);
  }
}
