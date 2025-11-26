import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { SendGift } from './entities/send-gift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SendGift])],
  controllers: [GiftController],
  providers: [GiftService],
  exports: [GiftService],
})
export class GiftModule {}
