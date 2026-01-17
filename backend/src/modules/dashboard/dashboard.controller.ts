import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { successResponse } from '../../utils/response.util';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get customer dashboard data (stats + recent activities)
   * GET /dashboard
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async getCustomerDashboard(@CurrentUser() user: any) {
    const data = await this.dashboardService.getCustomerDashboard(user.userId);
    return successResponse('Dashboard data retrieved successfully', data);
  }
}
