import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PointService } from './point.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('point')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get('my-points')
  @Roles('customer')
  async getMyPoints(@Request() req) {
    const customerId = req.user.id;
    return this.pointService.getCustomerPoints(customerId);
  }
}
