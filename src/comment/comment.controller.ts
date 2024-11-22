import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create-comment/:blogId')
  async createCommentPostId(@Param('blogId') blogId: number, @Body() body: { comment_content: string, employee_id: number }) {
    return this.commentService.createCommentPostId(blogId, body);
  }

  @Get('get-comment/:blogId')
  async getCommentPostId(@Param('blogId') blogId: number) {
    return this.commentService.getCommentPostId(blogId);
  }
}
