import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WowTokenDocument = WowToken & Document;

@Schema({
  // 关闭版本号, 否则存入的数据有个"__v"字段
  versionKey: false,
})
export class WowToken {
  @Prop({ unique: true, required: true, index: true })
  updateTime: string;

  @Prop()
  price: string;
}

export const WowTokenSchema = SchemaFactory.createForClass(WowToken);
