import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  // 关闭版本号, 否则存入的数据有个"__v"字段
  versionKey: false,
  // 自动设置创建时间和修改时间
  timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
  // 返回id字段
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createTime: Date;

  @Prop({ default: Date.now })
  updateTime: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
