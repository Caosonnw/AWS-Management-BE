import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as moment from 'moment-timezone';

@Injectable()
export class TimekeepingService {
  constructor(private prisma: PrismaClient) {}

  async clockInTimeKeeping(employee_id) {
    const employeeId = parseInt(employee_id);
    try {
      // Kiểm tra nhân viên có tồn tại không
      const user = await this.prisma.employees.findFirst({
        where: {
          employee_id: employeeId,
        },
      });

      if (user) {
        // Lấy ngày hiện tại theo định dạng ISO-8601 (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

        // Kiểm tra xem đã có bảng chấm công hôm nay chưa
        const existingTimekeeping = await this.prisma.timesheets.findMany({
          where: {
            employee_id: employeeId,
            date_timekeeping: new Date(today), // Lưu ngày theo định dạng `Date`
          },
        });

        if (!existingTimekeeping || existingTimekeeping.length === 0) {
          // Lấy giờ hiện tại theo múi giờ Việt Nam (HH:MM:SS)
          const clockInTime = moment()
            .tz('Asia/Ho_Chi_Minh')
            .format('HH:mm:ss');

          // Nếu chưa có bảng chấm công, tạo mới với clock_in
          const timekeeping = await this.prisma.timesheets.create({
            data: {
              employee_id: employeeId,
              date_timekeeping: new Date(today),
              clock_in: clockInTime,
              hours_worked: '0h 0m',
            },
          });
          return timekeeping;
        } else {
          return { message: 'Employee has already checked in today' };
        }
      } else {
        return { message: 'Employee not found' };
      }
    } catch (error) {
      throw new Error('Error creating timekeeping record: ' + error.message);
    }
  }

  async clockOutTimeKeeping(employee_id) {
    const employeeId = parseInt(employee_id);
    try {
      // Kiểm tra nhân viên có tồn tại không
      const user = await this.prisma.employees.findFirst({
        where: { employee_id: employeeId },
      });

      if (!user) {
        return { message: 'Employee not found' };
      }

      // Lấy ngày hiện tại theo múi giờ Việt Nam
      const today = new Date().toISOString().split('T')[0];

      // Tìm bảng chấm công của ngày hôm nay
      const existingTimekeeping = await this.prisma.timesheets.findFirst({
        where: {
          employee_id: employeeId,
          date_timekeeping: new Date(today),
        },
      });

      if (!existingTimekeeping) {
        return { message: 'No timekeeping record found for today' };
      }

      if (existingTimekeeping.clock_out) {
        return { message: 'Employee has already clocked out today' };
      }

      // Lấy giờ hiện tại theo múi giờ Việt Nam (HH:MM:SS)
      const clockOutTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');

      // Tính số giờ làm việc giữa clock_in và clock_out
      const clockInTime = moment(existingTimekeeping.clock_in, 'HH:mm:ss');
      const clockOutMoment = moment(clockOutTime, 'HH:mm:ss');
      const duration = moment.duration(clockOutMoment.diff(clockInTime));

      // Lấy số giờ và số phút
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();

      // Tạo chuỗi "HH:mm" để lưu vào hours_worked
      const hoursWorked = `${hours}h ${minutes}m`;

      // Cập nhật `clock_out` và `hours_worked`
      const updatedTimekeeping = await this.prisma.timesheets.update({
        where: { timesheet_id: existingTimekeeping.timesheet_id },
        data: {
          clock_out: clockOutTime,
          hours_worked: hoursWorked,
        },
      });

      return updatedTimekeeping;
    } catch (error) {
      throw new Error('Error updating timekeeping record: ' + error.message);
    }
  }
}
