import { Body, Controller, Get, Post, Put, Query, UseInterceptors, UseGuards } from '@nestjs/common';
import { PostListInterceptor, PostInterceptor } from './interceptor/post.interceptor';
import { PostService } from './post.service';
import { Post as Article } from './schemas/post.schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}
  @UseInterceptors(PostListInterceptor)
  @Get('list')
  async findAll(): Promise<Article[]> {
    return this.postService.findAll();
  }

  @UseInterceptors(PostInterceptor)
  @Get()
  // 这里和文档里写的不一样, 用Promise<Post>会报错
  async findOne(@Query('id') id): Promise<any> {
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data): Promise<any> {
    const { title, author, content } = data;
    if (!title || !content) return;
    return this.postService.create({ title, author, content });
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Body() data): Promise<any> {
    const { id, title, author, content } = data;
    if (!title || !content) return;
    return this.postService.update({ id, title, author, content });
  }
}
