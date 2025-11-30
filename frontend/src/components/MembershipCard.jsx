import React from 'react';
import Icon from './common/Icon';

const MembershipCard = ({ cardData }) => {
    if (!cardData) {
        return null;
    }

    console.log('cardData:', cardData);

    const { memberName, cardNumber, tierName, expiryDate } = cardData;

    // Tier-based gradient colors (following theme convention)
    // primary: #3333A6, secondary: #5858F5, accent: #FF8C00
    const getTierGradient = (tier) => {
        const tierLower = tier?.toLowerCase();
        switch (tierLower) {
            case 'vvip':
                // VVIP: Accent gradient (orange theme)
                return 'from-secondary to-purple-700';
            case 'vip':
                // VIP: Secondary gradient (light purple/blue theme)
                return 'from-accent to-orange-600';
            case 'u22':
            case 'member':
            default:
                // Member/U22: Primary gradient (dark blue theme)
                return 'from-blue-400 to-blue-600';
        }
    };

    // Format expiry date
    const formatExpiryDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className={`bg-gradient-to-r ${getTierGradient(tierName)} rounded-lg shadow-card p-8 text-white`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-2xl font-bold mb-2">BKinema {tierName} Member</h3>
                </div>
                <Icon name="star" className="text-4xl" />
            </div>
            <div className="mb-6">
                <p className="text-sm opacity-90 mb-1">Member Name</p>
                <p className="text-xl font-bold">{memberName || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm opacity-90 mb-1">Card Number</p>
                    <p className="font-bold">{cardNumber}</p>
                </div>
                <div>
                    <p className="text-sm opacity-90 mb-1">Expiry Date</p>
                    <p className="font-bold">{formatExpiryDate(expiryDate)}</p>
                </div>
            </div>
        </div>
    );
};

export default MembershipCard;
