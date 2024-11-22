import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskStatusDTO {
  @ApiProperty({
    description: 'The unique identifier of the task',
    example: 123,
  })
  task_id: number;

  @ApiProperty({
    description: 'The new status of the task',
    example: 'In Progress',
  })
  newStatus: string;
}
