import { Module } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamMemberController } from './team-member.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [TeamMemberController],
  providers: [TeamMemberService, PrismaClient],
})
export class TeamMemberModule {}
