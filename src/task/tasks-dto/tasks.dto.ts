import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsDate,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDTO {
  @ApiProperty({
    description: 'The name of the task',
    example: 'Create a new API endpoint',
  })
  @IsNotEmpty()
  @IsString()
  task_name: string;

  @ApiPropertyOptional({
    description: 'The description of the task',
    example:
      'This task involves creating a new API endpoint for user management.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The current status of the task',
    example: 'In Progress',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'The priority level of the task',
    example: 'High',
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this task',
    example: 123,
  })
  @IsOptional()
  @IsInt()
  assigned_to?: number;

  @ApiPropertyOptional({
    description: 'ID of the project this task belongs to',
    example: 456,
  })
  @IsOptional()
  @IsInt()
  project_id?: number;

  @ApiPropertyOptional({
    description: 'The status task of the task',
    example: 'Active',
  })
  @IsOptional()
  @IsString()
  status_task?: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the task was created',
  })
  @IsOptional()
  @IsDate()
  created?: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the task was last updated',
  })
  @IsOptional()
  @IsDate()
  updated?: Date;
}
