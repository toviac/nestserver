import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LibReservationDocument = LibReservation & Document;

@Schema({
  // 关闭版本号, 否则存入的数据有个"__v"字段
  versionKey: false,
  // 自动设置创建时间和修改时间
  timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
})
export class LibReservation {
  @Prop({ required: true })
  pid: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  pwd: string;

  @Prop()
  name: string;

  @Prop()
  sessionId: string;

  @Prop({ default: Date.now })
  createTime: Date;

  @Prop({ default: Date.now })
  updateTime: Date;
}

export const LibReservationSchema = SchemaFactory.createForClass(LibReservation);
