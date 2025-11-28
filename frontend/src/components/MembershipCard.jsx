import React from 'react';
import Icon from './common/Icon';

const MembershipCard = ({ cardData }) => {
    if (!cardData) {
        return null;
    }

    const { memberName, cardNumber, tierName, accumulatedPoints, expiryDate } = cardData;

    // Tier-based gradient colors
    const getTierGradient = (tier) => {
        const tierLower = tier?.toLowerCase();
        switch (tierLower) {
            case 'vvip':
                return 'from-indigo-600 via-purple-500 to-orange-400';
            case 'vip':
                return 'from-indigo-600 via-purple-500 to-orange-400';
            case 'u22':
                return 'from-blue-600 via-cyan-500 to-teal-400';
            case 'member':
            default:
                return 'from-blue-600 via-indigo-600 to-purple-500';
        }
    };

    // Format card number: XXXX-XXXX-XXXX-XXXX
    const formatCardNumber = (number) => {
        if (!number) return 'N/A';
        const numStr = number.toString().padStart(16, '0');
        return numStr.match(/.{1,4}/g)?.join('-') || numStr;
    };

    // Format points with commas
    const formatPoints = (points) => {
        return points?.toLocaleString() || '0';
    };

    return (
        <div className={`bg-gradient-to-r ${getTierGradient(tierName)} rounded-lg shadow-card p-8 text-white`}>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">BKinema {tierName} Member</h3>
                    <p className="text-sm opacity-90">Premium Membership</p>
                </div>
                <Icon name="star" className="text-4xl" />
            </div>

            <div className="mb-6">
                <p className="text-sm opacity-90 mb-1">Member Name</p>
                <p className="text-xl font-bold">{memberName || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-sm opacity-90 mb-1">Card Number</p>
                    <p className="font-mono font-bold text-base">{formatCardNumber(cardNumber)}</p>
                </div>
                {/* <div>
                    <p className="text-sm opacity-90 mb-1">Valid Until</p>
                    <p className="font-bold">{expiryDate || 'N/A'}</p>
                </div> */}
            </div>

            <div className="border-t border-white border-opacity-30 pt-4">
                <p className="text-sm">Accumulated Points: {formatPoints(accumulatedPoints)}</p>
            </div>
        </div>
    );
};

export default MembershipCard;
