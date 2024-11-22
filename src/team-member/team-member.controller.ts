import { Controller, Get, Param } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Team Member')
@Controller('team-member')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Get('get-team-members/:project_id')
  getTeamMembersByProject(@Param('project_id') project_id: string) {
    return this.teamMemberService.getTeamMembersByProject(parseInt(project_id));
  }
}
