import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaClient) {}

  // // Tạo project mới
  // async createProject(data: {
  //   project_name: string;
  //   start_date: Date;
  //   end_date?: Date;
  // }) {
  //   const project = await this.prisma.projects.create({
  //     data,
  //   });
  //   return {
  //     message: 'Project created successfully',
  //     project, // Trả về thông tin project vừa tạo
  //   };
  // }

  // Lấy tất cả các project
  async getAllProjects() {
    const projects = await this.prisma.projects.findMany({
      include: {
        Team_Members: {
          include: {
            Employees: true,
          },
        },
      },
    });
    return projects;
  }

  // Tạo project mới và khởi tạo nhóm chat
  async createProjectWithGroupChat(data: {
    project_name: string;
    start_date: Date;
    end_date?: Date;
    assignedMembers: number[];
  }) {
    const { project_name, start_date, end_date, assignedMembers } = data;

    // Tạo dự án
    const createdProject = await this.prisma.projects.create({
      data: {
        project_name,
        start_date,
        end_date,
      },
    });

    // Thêm thành viên vào dự án
    const teamMemberPromises = assignedMembers.map((memberId) =>
      this.prisma.team_Members.create({
        data: {
          project_id: createdProject.project_id,
          employee_id: memberId,
          is_in_group_chat: true,
        },
      }),
    );

    await Promise.all(teamMemberPromises);

    return {
      message: 'Project created with group chat successfully',
      project: createdProject,
    };
  }

  // Thêm thành viên vào project
  async addMemberToProject(project_id: number, employee_id: number) {
    // Kiểm tra xem employee_id có tồn tại trong bảng Employees không
    const employeeExists = await this.prisma.employees.findUnique({
      where: {
        employee_id: employee_id,
      },
    });

    if (!employeeExists) {
      throw new Error(`Employee with ID ${employee_id} does not exist`);
    }

    // Nếu tồn tại, thêm thành viên vào project
    const member = await this.prisma.team_Members.create({
      data: {
        project_id,
        employee_id,
      },
    });

    return {
      message: `Member with employee_id ${employee_id} added to project ${project_id} successfully`,
      member,
    };
  }

  // Lấy danh sách tất cả thành viên trong một project
  async getMembersByProject(projectId: number) {
    const project_id = parseInt(projectId.toString());
    const members = await this.prisma.team_Members.findMany({
      where: { project_id },
      include: {
        Employees: true, // Kết nối để lấy thông tin chi tiết về nhân viên
      },
    });

    if (members.length > 0) {
      return {
        message: `Found ${members.length} members in team ${project_id}`,
        members, // Trả về danh sách thành viên
      };
    } else {
      return {
        message: `No members found for team ${project_id}`,
        members: [],
      };
    }
  }
}
