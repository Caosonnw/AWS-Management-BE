import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // // API tạo project mới
  // @Post('/create-project')
  // async createProject(
  //   @Body() body: { project_name: string; start_date: Date; end_date?: Date },
  // ) {
  //   const { project_name, start_date, end_date } = body;
  //   return this.projectService.createProject({
  //     project_name,
  //     start_date,
  //     end_date,
  //   });
  // }

  // API tạo project mới và khởi tạo nhóm chat
  @Post('/create-project')
  async createProject(
    @Body()
    body: {
      project_name: string;
      start_date: Date;
      end_date?: Date;
      assignedMembers: number[];
    },
  ) {
    const { project_name, start_date, end_date, assignedMembers } = body;
    return this.projectService.createProjectWithGroupChat({
      project_name,
      start_date,
      end_date,
      assignedMembers,
    });
  }

  // API lấy tất cả các project
  @Get('/get-all-projects')
  async getAllProjects() {
    return this.projectService.getAllProjects();
  }

  // API thêm thành viên vào project
  @Post(':project_id/members/:employee_id')
  async addMemberToProject(
    @Param('project_id') project_id: string,
    @Param('employee_id') employee_id: string,
  ) {
    return this.projectService.addMemberToProject(
      parseInt(project_id),
      parseInt(employee_id),
    );
  }

  // API lấy danh sách tất cả thành viên trong một project
  @Get(':project_id/members')
  async getMembersByProject(@Param('project_id') projectId: number) {
    return this.projectService.getMembersByProject(projectId);
  }
}
