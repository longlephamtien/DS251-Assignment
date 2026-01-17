import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';

@Module({
  controllers: [PointController],
  providers: [PointService],
  exports: [PointService],
})
export class PointModule {}
