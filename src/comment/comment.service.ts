import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaClient) {}

  async createCommentPostId(
    blogId: number,
    body: { comment_content: string; employee_id: number },
  ) {
    const blogID = parseInt(blogId.toString());
    const checkBlog = await this.prisma.blog.findFirst({
      where: {
        blog_id: blogID,
      },
    });
    if (!checkBlog) {
      throw new Error('Blog not found');
    } else {
      return this.prisma.comments.create({
        data: {
          blog_id: blogID,
          comment_content: body.comment_content,
          employee_id: body.employee_id,
          created_at: new Date(),
        },
      });
    }
  }

  async getCommentPostId(blogId: number) {
    const blogID = parseInt(blogId.toString());
    const checkBlog = await this.prisma.blog.findFirst({
      where: {
        blog_id: blogID,
      },
    });
    if (!checkBlog) {
      throw new Error('Blog not found');
    } else {
      return this.prisma.comments.findMany({
        where: {
          blog_id: blogID,
        },
      });
    }
  }
}
