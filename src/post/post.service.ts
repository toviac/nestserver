import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private postModel: Model<PostDocument>) {}

  async findAll(): Promise<Post[]> {
    return this.postModel
      .find(
        {},
        {
          title: 1,
          author: 1,
          createTime: 1,
          updateTime: 1,
        },
      )
      .sort({ _id: -1 });
  }
  async findOne(postId: string): Promise<any> {
    const id = Types.ObjectId(postId);
    return this.postModel.find({ _id: id });
  }
}
