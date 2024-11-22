import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { TimekeepingModule } from './timekeeping/timekeeping.module';
import { ProjectModule } from './project/project.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { TaskModule } from './task/task.module';
import { ChatGateway } from './gateway/chat.gateway';
import { MailModule } from './mail/mail.module';
import { BlogModule } from './blog/blog.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    EmployeeModule,
    TimekeepingModule,
    ProjectModule,
    TeamMemberModule,
    TaskModule,
    MailModule,
    BlogModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, ChatGateway],
})
export class AppModule {}
