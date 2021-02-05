import { Controller, Get, Param } from '@nestjs/common';
import { PostService } from './post.service';
import { Post } from './schemas/post.schema';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}
  @Get('list')
  async findAll(): Promise<Post[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  // 这里和文档里写的不一样, 用Promise<Post>会报错
  async findOne(@Param('id') id): Promise<any> {
    return this.postService.findOne(id);
  }
}
