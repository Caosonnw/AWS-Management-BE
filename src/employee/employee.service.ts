import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAllEmployees() {
    const users = await this.prisma.employees.findMany();

    if (users && users.length > 0) {
      const result = users.map((user) => ({
        employee_id: user.employee_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        avatar: user.avatar,
        date_of_birth: user.date_of_birth,
        hire_date: user.hire_date,
        salary: user.salary,
        role: user.role,
      }));

      return {
        data: result,
        message: 'Get all employees successfully',
        status: 200,
        date: new Date(),
      };
    } else {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }
  }

  async getEmployeeById(employee_id: number) {
    const user_id = parseInt(employee_id.toString());
    const user = await this.prisma.employees.findUnique({
      where: {
        employee_id: user_id,
      },
    });

    if (user) {
      const result = {
        employee_id: user.employee_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        avatar: user.avatar,
        date_of_birth: user.date_of_birth,
        hire_date: user.hire_date,
        salary: user.salary,
        role: user.role,
      };

      return {
        data: result,
        message: 'Get employee by id successfully',
        status: 200,
        date: new Date(),
      };
    } else {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
  }

  async uploadAvatar(employee_id: number, photo_url: string) {
    const user_id = parseInt(employee_id.toString());
    const user = await this.prisma.employees.findUnique({
      where: {
        employee_id: user_id,
      },
    });

    if (user) {
      const result = await this.prisma.employees.update({
        where: {
          employee_id: user_id,
        },
        data: {
          avatar: photo_url,
        },
      });

      return {
        message: 'Upload avatar successfully',
        status: 200,
        date: new Date(),
      };
    } else {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
  }
}
