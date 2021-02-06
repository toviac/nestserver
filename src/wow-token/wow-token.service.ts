import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWowTokenDto } from './dto/wow-token.dto';
import { WowToken, WowTokenDocument } from './schemas/wow-token.schema';

@Injectable()
export class WowTokenService {
  constructor(@InjectModel('WowToken') private wowTokenModel: Model<WowTokenDocument>) {}

  async findAll(): Promise<WowToken[]> {
    return this.wowTokenModel
      .find(
        {},
        {
          updateTime: 1,
          price: 1,
          createTime: 1,
        },
      )
      .sort({ _id: 1 });
  }

  async create(CreateWowTokenDto: CreateWowTokenDto): Promise<any> {
    return this.wowTokenModel.create(CreateWowTokenDto);
  }
}
