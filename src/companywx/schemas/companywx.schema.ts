import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyWxDocument = CompanyWx & Document;

@Schema({
  // 关闭版本号, 否则存入的数据有个"__v"字段
  versionKey: false,
  // 自动设置创建时间和修改时间
  timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
})
export class CompanyWx {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  appId: string;

  @Prop({ required: true })
  appSecret: string;

  @Prop()
  companyId: string;

  @Prop({ default: Date.now })
  updateTime: Date;
}

export const CompanyWxSchema = SchemaFactory.createForClass(CompanyWx);
