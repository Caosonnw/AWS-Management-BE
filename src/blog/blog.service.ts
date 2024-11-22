import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaClient) {}

  async createPost(data: {
    title: string;
    content: string;
    images: string[];
    employee_id: number | string;
  }) {
    return this.prisma.blog.create({
      data: {
        title: data.title,
        content: data.content,
        images: JSON.stringify(data.images),
        employee_id:
          typeof data.employee_id === 'string'
            ? parseInt(data.employee_id, 10)
            : data.employee_id,
        created_at: new Date(),
      },
    });
  }

  async getAllPosts() {
    const posts = await this.prisma.blog.findMany({
      include: {
        Employees: {
          select: {
            employee_id: true,
            full_name: true,
            email: true,
            avatar: true,
          },
        },
        Comments: true,
      },
    });
    return posts.map((post) => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    }));
  }
}
