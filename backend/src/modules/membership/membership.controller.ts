import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Membership')
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  /**
   * Get membership card for current customer
   * GET /membership/card
   */
  @Get('card')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiOperation({ summary: 'Get membership card information for logged-in customer' })
  async getMembershipCard(@CurrentUser() user: any) {
    return this.membershipService.getMembershipCard(user.userId);
  }
}
