import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTaskDTO } from './tasks-dto/tasks.dto';
import { UpdateTaskStatusDTO } from './tasks-dto/updateTaskStatus.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class TaskService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaClient,
  ) {}

  async createNewTask(createTaskDTO: CreateTaskDTO) {
    const {
      task_name,
      description,
      status,
      priority,
      assigned_to,
      project_id,
      status_task,
      created,
      updated,
    } = createTaskDTO;

    const task = await this.prisma.tasks.create({
      data: {
        task_name,
        description,
        status,
        priority,
        assigned_to,
        project_id,
        status_task,
        created: created || new Date(),
        updated: updated || new Date(),
      },
    });

    return {
      message: 'Task created successfully',
      task,
    };
  }

  async getTasksByProject(project_id: number) {
    const tasks = await this.prisma.tasks.findMany({
      where: {
        project_id,
      },
    });

    return tasks;
  }

  // async updateTaskStatus(updateTaskStatusDTO: UpdateTaskStatusDTO) {
  //   const { task_id, newStatus } = updateTaskStatusDTO;

  //   const updatedTask = await this.prisma.tasks.update({
  //     where: { task_id },
  //     data: { status: newStatus, updated: new Date() },
  //   });

  //   // Phát sự kiện cập nhật status
  //   this.taskGateway.server.emit('taskStatusUpdated', updatedTask);

  //   return {
  //     message: 'Task status updated successfully',
  //     task: updatedTask,
  //   };
  // }

  async updateTaskStatus(
    taskId: number,
    updateTaskStatusDto: UpdateTaskStatusDTO,
  ) {
    const updatedTask = await this.prisma.tasks.update({
      where: { task_id: taskId },
      data: { status: updateTaskStatusDto.newStatus, updated: new Date() },
      select: {
        task_name: true, // Chọn lấy `task_name`
        assigned_to: true,
        status: true,
        updated: true,
        // Thêm các trường khác nếu cần thiết
      },
    });

    // Kiểm tra và chuyển `assigned_to` thành mảng ID nếu cần thiết
    const assignedUserIds = Array.isArray(updatedTask.assigned_to)
      ? updatedTask.assigned_to
      : [updatedTask.assigned_to]; // Nếu `assigned_to` là một ID đơn lẻ, chuyển nó thành mảng

    // Lấy thông tin email của những người được chỉ định
    const assignedUsers = await this.prisma.employees.findMany({
      where: {
        employee_id: { in: assignedUserIds },
      },
    });

    // Gửi email cho từng người dùng
    for (const user of assignedUsers) {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Trạng thái của task ${updatedTask.task_name} đã được thay đổi`,
        text: `Trạng thái của task ${updatedTask.task_name} đã thay đổi thành ${updateTaskStatusDto.newStatus}. Vui lòng kiểm tra chi tiết.`,
      });
    }

    // Phát sự kiện cập nhật status qua WebSocket
    // this.taskGateway.server.emit('taskStatusUpdated', updatedTask);

    return {
      message: 'Task status updated successfully',
      task: updatedTask,
    };
  }

  async getTaskDetail(task_id: number) {
    const task = await this.prisma.tasks.findUnique({
      where: { task_id },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }
}
