import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private postModel: Model<PostDocument>) {}

  async findAll(): Promise<Post[]> {
    // 不加 lean 查出来的是 Mongoose 文档，
    // 加 lean 查询出来的文档是普通的 JavaScript 对象，
    // 从而没有 save 方法，没有 getters 和 setters，因此会有更高的性能。
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
      .sort({ _id: -1 })
      .lean();
  }
  async findOne(postId: string): Promise<any> {
    const id = Types.ObjectId(postId);
    return this.postModel.findOne({ _id: id });
  }
  async create({ title, author, content }): Promise<any> {
    return this.postModel.create({ title, author, content });
  }
  async update({ id: postId, title, author, content }): Promise<any> {
    const id = Types.ObjectId(postId);
    return this.postModel.updateOne({ _id: id }, { title, author, content });
  }
}
