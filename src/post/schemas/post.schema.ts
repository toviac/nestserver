import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({
  // 关闭版本号, 否则存入的数据有个"__v"字段
  versionKey: false,
  // 自动设置创建时间和修改时间
  timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
})
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop()
  author: string;

  @Prop({ default: Date.now })
  createTime: Date;

  @Prop({ default: Date.now })
  updateTime: Date;

  @Prop()
  content: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
