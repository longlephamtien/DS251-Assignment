import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MembershipService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Get membership card information for a customer
   * Calls sp_get_membership_card stored procedure
   */
  async getMembershipCard(customerId: number) {
    try {
      // Call stored procedure
      const result = await this.dataSource.query(
        'CALL sp_get_membership_card(?)',
        [customerId]
      );

      // SP returns array of result sets, first element is our data
      const cardData = result[0]?.[0];

      if (!cardData) {
        throw new NotFoundException('Membership card not found for this customer');
      }

      return {
        customerId: parseInt(cardData.customer_id),
        membershipTitle: cardData.membership_title,
        tierName: cardData.membership_tier,
        memberName: cardData.member_name,
        cardNumber: cardData.card_number,
        memberSinceDate: cardData.member_since_date,
        expiryDate: cardData.valid_until_date,
        boxOfficeDiscount: parseFloat(cardData.box_office_discount || 0),
        concessionDiscount: parseFloat(cardData.concession_discount || 0),
        accumulatedPoints: parseFloat(cardData.accumulated_points || 0),
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        error.sqlMessage || error.message || 'Failed to get membership card'
      );
    }
  }
}
