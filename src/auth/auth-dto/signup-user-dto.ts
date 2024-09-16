import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SignUpUserDto {
  @ApiProperty({
    description: 'Full name of the employee',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  full_name: string;

  @ApiProperty({
    description: 'Email address of the employee',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Length(1, 100)
  email: string;

  @ApiProperty({
    description: 'Password for the employee account',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  password: string;

  @ApiProperty({
    description: 'Phone number of the employee',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 15)
  phone_number?: string;

  @ApiProperty({
    description: 'Avatar URL of the employee',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatar?: string;

  @ApiProperty({
    description: 'Date of birth of the employee',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: Date;

  @ApiProperty({
    description: 'Hire date of the employee',
    example: '2023-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  hire_date?: Date;

  @ApiProperty({
    description: 'Salary of the employee',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  salary?: number;

  @ApiProperty({
    description: 'Job ID of the employee',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  job_id?: number;

  @ApiProperty({
    description: 'Department ID of the employee',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  department_id?: number;

  @ApiProperty({
    description: 'Manager ID of the employee',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt()
  manager_id?: number;
}
