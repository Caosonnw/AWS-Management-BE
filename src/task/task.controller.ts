import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateTaskDTO } from './tasks-dto/tasks.dto';
import { UpdateTaskStatusDTO } from './tasks-dto/updateTaskStatus.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create-new-task')
  createNewTask(@Body() createTaskDTO: CreateTaskDTO) {
    return this.taskService.createNewTask(createTaskDTO);
  }

  @Get('get-task-by-project/:project_id')
  getTasksByProject(@Param('project_id') project_id: string) {
    return this.taskService.getTasksByProject(parseInt(project_id));
  }

  // @Put('update-task-status')
  // updateTaskStatus(@Body() updateTaskStatusDTO: UpdateTaskStatusDTO) {
  //   return this.taskService.updateTaskStatus(updateTaskStatusDTO);
  // }

  @Put('update-task-status')
  updateTaskStatus(@Body() updateTaskStatusDTO: UpdateTaskStatusDTO) {
    return this.taskService.updateTaskStatus(
      updateTaskStatusDTO.task_id,
      updateTaskStatusDTO,
    );
  }

  @Get('get-task-detail/:task_id')
  getTaskDetail(@Param('task_id') task_id: string) {
    return this.taskService.getTaskDetail(parseInt(task_id));
  }
}
