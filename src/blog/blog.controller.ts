import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from 'src/config/upload.config';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('create-post')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5, uploadOptions))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        employee_id: { type: 'number' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    createPostDto: {
      title: string;
      content: string;
      employee_id: number;
    },
  ) {
    const imageUrls = files.map((file) => file.filename); 
    return this.blogService.createPost({ ...createPostDto, images: imageUrls });
  }


  @Get('get-all-posts')
  async getAllPosts() {
    return this.blogService.getAllPosts();
  }
}
