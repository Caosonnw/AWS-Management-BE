import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TeamMemberService {
  constructor(private readonly prisma: PrismaClient) {}

  async getTeamMembersByProject(project_id: number) {
    const teamMembers = await this.prisma.team_Members.findMany({
      where: {
        project_id,
      },
    });

    return teamMembers;
  }
}
