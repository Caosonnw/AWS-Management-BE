import { Controller, Param, Post, Put } from '@nestjs/common';
import { TimekeepingService } from './timekeeping.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Timekeeping')
@Controller('timekeeping')
export class TimekeepingController {
  constructor(private readonly timekeepingService: TimekeepingService) {}

  @Post('clockIn/:employee_id')
  clockInTimeKeeping(@Param('employee_id') employee_id: number) {
    return this.timekeepingService.clockInTimeKeeping(employee_id);
  }

  @Put('clockOut/:employee_id')
  clockOutTimeKeeping(@Param('employee_id') employee_id: number) {
    return this.timekeepingService.clockOutTimeKeeping(employee_id);
  }
}
