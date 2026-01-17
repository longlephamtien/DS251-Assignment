import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/common/Icon';

const giftCardCategories = [
  {
    id: 'christmas',
    name: 'Christmas 2025',
    cards: [
      { id: 1, title: 'Christmas Joy', design: 'christmas-1', image: 'christmas-1.png' },
      { id: 2, title: 'Winter Wonderland', design: 'christmas-2', image: 'christmas-2.png' },
      { id: 3, title: 'Holiday Magic', design: 'christmas-3', image: 'christmas-3.png' },
      { id: 4, title: 'Festive Cinema', design: 'christmas-4', image: 'christmas-4.png' },
    ]
  },
  {
    id: 'new-collection',
    name: 'New Collection',
    cards: [
      { id: 5, title: 'Modern Cinema', design: 'new-1', image: 'new-1.png' },
      { id: 6, title: 'Urban Style', design: 'new-2', image: 'new-2.png' },
      { id: 7, title: 'Premium Experience', design: 'new-3', image: 'new-3.png' },
      { id: 8, title: 'Elite Collection', design: 'new-4', image: 'new-4.png' },
    ]
  },
  {
    id: 'birthday',
    name: 'Birthday',
    cards: [
      { id: 9, title: 'Birthday Celebration', design: 'birthday-1', image: 'birthday-1.png' },
      { id: 10, title: 'Party Time', design: 'birthday-2', image: 'birthday-2.png' },
    ]
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    cards: [
      { id: 11, title: 'Grateful Heart', design: 'thank-1', image: 'thank-1.png' },
      { id: 12, title: 'Appreciation', design: 'thank-2', image: 'thank-2.png' },
    ]
  },
  {
    id: 'romantic',
    name: 'Romantic & Love',
    cards: [
      { id: 13, title: 'Romantic Moments', design: 'romantic-1', image: 'romantic-1.png' },
      { id: 14, title: 'Love Story', design: 'romantic-2', image: 'romantic-2.png' },
      { id: 15, title: 'Date Night', design: 'romantic-3', image: 'romantic-3.png' },
    ]
  }
];

const amounts = [
  { value: 100000, label: '100,000 VND' },
  { value: 200000, label: '200,000 VND' },
  { value: 300000, label: '300,000 VND' },
  { value: 500000, label: '500,000 VND' },
  { value: 1000000, label: '1,000,000 VND' },
];

function GiftCardPreview({ card, amount }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const getCardImage = () => {
      if (card.image) {
        try {
          return require(`../assets/media/gift/${card.image}`);
        } catch (error) {
          console.warn(`Gift card image not found: ${card.image}`);
          return null;
        }
      }
      return null;
    };

    const cardImage = getCardImage();

    img.onload = () => {
      // Set high resolution canvas size
      const scale = 2; // Increase resolution
      canvas.width = 1600 * scale;
      canvas.height = 1000 * scale;
      
      // Scale context for high DPI
      ctx.scale(scale, scale);

      // Draw the background image
      ctx.drawImage(img, 0, 0, 1600, 1000);

      // Add gradient overlay from bottom
      const gradient = ctx.createLinearGradient(0, 500, 0, 1000);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1600, 1000);

      // Measure text to make badge adaptive
      const amountText = `${Math.round(amount).toLocaleString()} VND`;
      ctx.font = 'bold 72px Verdana';
      const amountMetrics = ctx.measureText(amountText);
      const amountWidth = amountMetrics.width;
      
      // Calculate badge dimensions based on text with equal padding
      const horizontalPadding = 40;
      const badgeWidth = amountWidth + (horizontalPadding * 2);
      const badgeHeight = 180; // Increased height from 140 to 180
      const badgeX = 60;
      const badgeY = 940 - badgeHeight;
      
      // Badge background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 12);
      ctx.fill();
      ctx.stroke();

      // Badge text - "Gift Card Value"
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 36px Verdana';
      ctx.fillText('Gift Value', badgeX + horizontalPadding, badgeY + 65);

      // Badge text - Amount (larger) - centered within badge
      ctx.fillStyle = 'white';
      ctx.font = 'bold 72px Verdana';
      ctx.fillText(amountText, badgeX + horizontalPadding, badgeY + 140);
      

      // Draw info text at bottom right (smaller)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '24px Verdana';
      ctx.textAlign = 'right';
      ctx.fillText('Valid for 12 months', 1540, 910);
      ctx.fillText('Use at any BKinema', 1540, 940);
      ctx.textAlign = 'left'; // Reset alignment
    };

    if (cardImage) {
      img.src = cardImage;
    } else {
      // Fallback gradient if no image
      const scale = 2;
      canvas.width = 1600 * scale;
      canvas.height = 1000 * scale;
      ctx.scale(scale, scale);
      
      const gradient = ctx.createLinearGradient(0, 0, 1600, 1000);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1600, 1000);
    }
  }, [card, amount]);

  // Helper function to draw rounded rectangles
  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  return (
    <div className="relative aspect-[16/10] rounded-lg overflow-hidden shadow-xl bg-gray-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
}

function ThemePreview({ card }) {
  const getCardImage = () => {
    if (card.image) {
      try {
        return require(`../assets/media/gift/${card.image}`);
      } catch (error) {
        console.warn(`Gift card image not found: ${card.image}`);
        return null;
      }
    }
    return null;
  };

  const cardImage = getCardImage();

  return (
    <div className="relative aspect-[16/10] rounded-lg overflow-hidden">
      {cardImage ? (
        <img
          src={cardImage}
          alt={card.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary"></div>
      )}
    </div>
  );
}

export default function GiftCardPage() {
  const [selectedCategory, setSelectedCategory] = useState('christmas');
  const [selectedCard, setSelectedCard] = useState(giftCardCategories[0].cards[0]);
  const [selectedAmount, setSelectedAmount] = useState(amounts[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  const currentCategory = giftCardCategories.find(cat => cat.id === selectedCategory);
  
  const displayAmount = isCustomAmount && customAmount ? parseInt(customAmount) || 0 : selectedAmount.value;
  
  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    if (value) {
      setIsCustomAmount(true);
    }
  };
  
  const handlePresetAmountClick = (amount) => {
    setSelectedAmount(amount);
    setIsCustomAmount(false);
    setCustomAmount('');
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section - Consistent with Movies Page */}
      <div className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="relative mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-center tracking-wider relative inline-block w-full">
              <span className="relative z-10 bg-white px-6 text-gray-800" style={{
                textShadow: '2px 2px 0px #e5e5e5, 4px 4px 0px #d4d4d4',
                letterSpacing: '0.05em'
              }}>
                BKINEMA GIFT CARDS
              </span>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-0" />
            </h2>
          </div>
          <p className="text-center text-text-sub">
            Your prepaid card at BKinema
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">

        {/* Gift Card Selector */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Choose Your Gift Card</h2>
          
          {/* Category Selection */}
          <div className="mb-8">
            <div className="flex gap-3 overflow-x-auto pb-4">
              {giftCardCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedCard(category.cards[0]);
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-text-main hover:bg-gray-100 shadow'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card Selection */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Select Design</h3>
              <div className="grid grid-cols-2 gap-4">
                {currentCategory?.cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`relative aspect-[16/10] rounded-lg overflow-hidden transition-all ${
                      selectedCard.id === card.id
                        ? 'ring-4 ring-primary shadow-xl scale-105'
                        : 'hover:scale-105 shadow-card'
                    }`}
                  >
                    <ThemePreview card={card} />
                  </button>
                ))}
              </div>

              {/* Amount Selection */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-primary mb-4">Select Amount</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {amounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => handlePresetAmountClick(amount)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        !isCustomAmount && selectedAmount.value === amount.value
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-white text-text-main hover:bg-gray-100 shadow'
                      }`}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Amount Input */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or enter custom amount (VND):
                  </label>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter amount (min 50,000)"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      isCustomAmount
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400'
                    } focus:outline-none focus:border-primary`}
                  />
                  {customAmount && parseInt(customAmount) < 50000 && (
                    <p className="text-red-500 text-xs mt-1">Minimum amount is 50,000 VND</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview and Purchase */}
            <div className="bg-white rounded-lg shadow-card p-8">
              <h3 className="text-xl font-bold text-primary mb-4">Preview</h3>
              <div className="mb-6">
                <GiftCardPreview card={selectedCard} amount={displayAmount} />
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-text-main">
                  <span>Design:</span>
                  <span className="font-semibold">{selectedCard.title}</span>
                </div>
                <div className="flex justify-between text-text-main">
                  <span>Category:</span>
                  <span className="font-semibold">{currentCategory?.name}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary border-t pt-4">
                  <span>Total:</span>
                  <span>{displayAmount.toLocaleString()} VND</span>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl">
                Purchase Gift Card
              </button>

              <p className="text-xs text-text-sub text-center mt-4">
                You will receive your gift card via email within 5 minutes
              </p>
            </div>
          </div>
        </section>

        {/* Terms and Conditions */}
        <section>
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Terms & Conditions</h2>
            <div className="space-y-3 text-text-main">
              <p className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Gift cards are valid for purchases of movie tickets, F&B, and merchandise at BKinema cinemas</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Validity: 12 months from activation date</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Can be topped up with minimum 50,000 VND to extend expiry date</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Gift cards are non-refundable and may not be redeemed for cash</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>eGift is a digital card (cannot be redeemed to physical card)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Loyalty points are applied to the gift card user, not the purchaser</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Cannot be used to purchase other gift cards or vouchers</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
