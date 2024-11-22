import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadAvatarDto } from 'src/config/upload-dto/upload-avatar-dto';
import { uploadOptions } from 'src/config/upload.config';
import { EmployeeService } from './employee.service';

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // @UseGuards(JwtAuthGuard)
  @Get('get-all-employees')
  getAllEmployees() {
    return this.employeeService.getAllEmployees();
  }

  @Get('get-employee-by-id/:employee_id')
  getEmployeeById(@Param('employee_id') employee_id: number) {
    return this.employeeService.getEmployeeById(employee_id);
  }

  @Post('upload-avatar/:employee_id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', uploadOptions))
  @ApiBody({
    description: 'Upload avatar',
    type: UploadAvatarDto,
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('employee_id') employee_id: number,
  ) {
    const photo_url = file.filename;
    return this.employeeService.uploadAvatar(employee_id, photo_url);
  }
}
