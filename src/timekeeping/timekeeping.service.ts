import { Injectable, HttpStatus } from '@nestjs/common'; // Thêm import HttpStatus
import { PrismaClient } from '@prisma/client';
import * as moment from 'moment-timezone';

@Injectable()
export class TimekeepingService {
  constructor(private prisma: PrismaClient) {}

  // Hàm tính toán khoảng cách Euclidean giữa hai embeddings
  calculateEuclideanDistance(
    embedding1: number[],
    embedding2: number[],
  ): number {
    if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
      throw new Error('Embeddings are not arrays');
    }

    const sum = embedding1.reduce(
      (acc, val, i) => acc + Math.pow(val - embedding2[i], 2),
      0,
    );
    return Math.sqrt(sum);
  }

  async registerFace(employeeId: number, embeddings: number[]) {
    try {
      // Chuyển embeddings thành JSON
      const embeddingsJSON = JSON.stringify(embeddings);

      // Cập nhật embeddings cho nhân viên trong DB
      const updatedEmployee = await this.prisma.employees.update({
        where: { employee_id: employeeId },
        data: { face_embeddings: embeddingsJSON },
      });

      return {
        message: 'Face embeddings saved successfully',
        employee: updatedEmployee,
      };
    } catch (error) {
      console.error('Error saving face embeddings:', error);
      throw new Error('Failed to save face embeddings');
    }
  }

  async clockInTimeKeeping(employee_id: number, embeddings: any) {
    const employeeId = parseInt(employee_id.toString());

    // Chuyển embeddings thành mảng nếu cần
    const receivedEmbeddings = Array.isArray(embeddings)
      ? embeddings
      : Object.values(embeddings);

    try {
      const user = await this.prisma.employees.findFirst({
        where: { employee_id: employeeId },
      });

      if (user) {
        const registeredEmbeddings = JSON.parse(user.face_embeddings as string);

        const registeredEmbeddingArray = Array.isArray(registeredEmbeddings)
          ? registeredEmbeddings
          : Object.values(registeredEmbeddings);

        // So sánh embeddings
        const distance = this.calculateEuclideanDistance(
          receivedEmbeddings,
          registeredEmbeddingArray,
        );

        const threshold = 0.6;
        if (distance > threshold) {
          return {
            message: 'Face does not match',
            statusCode: HttpStatus.UNAUTHORIZED,
          };
        }

        // Nếu khuôn mặt khớp, tiếp tục với quy trình check-in
        const today = new Date().toISOString().split('T')[0];
        const existingTimekeeping = await this.prisma.timesheets.findMany({
          where: {
            employee_id: employeeId,
            date_timekeeping: new Date(today),
          },
        });

        if (!existingTimekeeping || existingTimekeeping.length === 0) {
          const clockInTime = moment()
            .tz('Asia/Ho_Chi_Minh')
            .format('HH:mm:ss');

          const timekeeping = await this.prisma.timesheets.create({
            data: {
              employee_id: employeeId,
              date_timekeeping: new Date(today),
              clock_in: clockInTime,
              hours_worked: '0h 0m',
            },
          });
          return {
            data: timekeeping,
            message: 'Employee checked in successfully',
          };
        } else {
          return { message: 'Employee has already checked in today' };
        }
      } else {
        return {
          message: 'Employee not found',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
    } catch (error) {
      throw new Error('Error creating timekeeping record: ' + error.message);
    }
  }

  async clockOutTimeKeeping(employee_id: number, embeddings: any) {
    const employeeId = parseInt(employee_id.toString());

    // Chuyển embeddings thành mảng nếu cần
    const receivedEmbeddings = Array.isArray(embeddings)
      ? embeddings
      : Object.values(embeddings);

    try {
      // Kiểm tra nhân viên có tồn tại không
      const user = await this.prisma.employees.findFirst({
        where: { employee_id: employeeId },
      });

      if (!user) {
        return {
          message: 'Employee not found',
          statusCode: HttpStatus.NOT_FOUND, // Thêm HttpStatus
        };
      }

      const registeredEmbeddings = JSON.parse(user.face_embeddings as string);

      const registeredEmbeddingArray = Array.isArray(registeredEmbeddings)
        ? registeredEmbeddings
        : Object.values(registeredEmbeddings);

      // So sánh embeddings
      const distance = this.calculateEuclideanDistance(
        receivedEmbeddings,
        registeredEmbeddingArray,
      );
      const threshold = 0.6; // Ngưỡng để xác định khớp (có thể tùy chỉnh)

      if (distance > threshold) {
        return {
          message: 'Face does not match',
          statusCode: HttpStatus.UNAUTHORIZED,
        };
      }

      const today = new Date().toISOString().split('T')[0];
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

      const clockOutTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
      const clockInTime = moment(existingTimekeeping.clock_in, 'HH:mm:ss');
      const clockOutMoment = moment(clockOutTime, 'HH:mm:ss');
      const duration = moment.duration(clockOutMoment.diff(clockInTime));

      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const hoursWorked = `${hours}h ${minutes}m`;

      const updatedTimekeeping = await this.prisma.timesheets.update({
        where: { timesheet_id: existingTimekeeping.timesheet_id },
        data: {
          clock_out: clockOutTime,
          hours_worked: hoursWorked,
        },
      });

      return {
        data: updatedTimekeeping,
        message: 'Employee clocked out successfully',
      };
    } catch (error) {
      throw new Error('Error updating timekeeping record: ' + error.message);
    }
  }

  async checkTimekeeping(employee_id: number) {
    const employeeId = parseInt(employee_id.toString());
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingTimekeeping = await this.prisma.timesheets.findMany({
        where: {
          employee_id: employeeId,
          date_timekeeping: new Date(today),
        },
      });

      if (!existingTimekeeping || existingTimekeeping.length === 0) {
        return {
          message: 'No timekeeping record found for today',
          statusCode: HttpStatus.NOT_FOUND,
        };
      } else if (existingTimekeeping.length === 1) {
        return {
          data: existingTimekeeping[0],
          message: 'Timekeeping record retrieved successfully',
          statusCode: HttpStatus.OK,
        };
      }
    } catch (error) {
      throw new Error('Error fetching timekeeping record: ' + error.message);
    }
  }

  async getTotalTimekeeping(employee_id: number) {
    const employeeId = parseInt(employee_id.toString());

    // Lấy ngày đầu và ngày cuối của tháng hiện tại
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    try {
      // Kiểm tra xem nhân viên có tồn tại không
      const user = await this.prisma.employees.findFirst({
        where: { employee_id: employeeId },
      });

      if (!user) {
        return {
          message: 'Employee not found',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      // Lấy tất cả các bản ghi timekeeping của nhân viên trong tháng hiện tại
      const timekeepingRecords = await this.prisma.timesheets.findMany({
        where: {
          employee_id: employeeId,
          date_timekeeping: {
            gte: startOfMonth, // Ngày lớn hơn hoặc bằng ngày đầu tháng
            lte: endOfMonth, // Ngày nhỏ hơn hoặc bằng ngày cuối tháng
          },
        },
        select: {
          hours_worked: true, // Chỉ lấy trường hours_worked
        },
      });

      // Hàm chuyển đổi từ 'xh ym' sang số giờ thập phân
      const convertHoursWorkedToDecimal = (hoursWorked: string) => {
        const regex = /(\d+)h\s*(\d*)m?/; // Biểu thức chính quy để tách giờ và phút
        const match = hoursWorked.match(regex);

        if (!match) return 0;

        const hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        return hours + minutes / 60; // Chuyển phút thành phần lẻ của giờ
      };

      // Tính tổng số giờ làm việc
      const totalHoursDecimal = timekeepingRecords.reduce((sum, record) => {
        return sum + convertHoursWorkedToDecimal(record.hours_worked);
      }, 0);

      // Chuyển đổi tổng số giờ từ số thập phân sang giờ và phút
      const totalHours = Math.floor(totalHoursDecimal); // Giờ
      const totalMinutes = Math.round((totalHoursDecimal - totalHours) * 60); // Phút

      return {
        data: {
          hours: totalHours,
          minutes: totalMinutes,
        },
        message: 'Total hours worked retrieved successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw new Error('Error fetching total hours worked: ' + error.message);
    }
  }
}
