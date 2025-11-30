import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, Query } from '@nestjs/common';
import { PointService } from './point.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApplyPointsDto } from './dto/apply-points.dto';

@Controller('point')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get('my-points')
  @Roles('customer')
  async getMyPoints(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const customerId = req.user.id;
    const parsedLimit = limit ? parseInt(limit) : 20;
    const parsedOffset = offset ? parseInt(offset) : 0;
    return this.pointService.getCustomerPoints(customerId, parsedLimit, parsedOffset);
  }

  @Post('apply')
  @Roles('customer')
  async applyPoints(@Request() req, @Body() applyPointsDto: ApplyPointsDto) {
    const customerId = req.user.id;
    return this.pointService.applyPoints(customerId, applyPointsDto);
  }

  @Delete('remove/:bookingId')
  @Roles('customer')
  async removePoints(@Request() req, @Param('bookingId') bookingId: string) {
    const customerId = req.user.id;
    return this.pointService.removePoints(customerId, parseInt(bookingId));
  }
}
