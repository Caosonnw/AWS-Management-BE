import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [JwtModule, AuthModule],
  controllers: [CommentController],
  providers: [CommentService, PrismaClient],
})
export class CommentModule {}
