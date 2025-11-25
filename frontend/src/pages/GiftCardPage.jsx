import React, { useState } from 'react';
import Icon from '../components/common/Icon';

const giftCardCategories = [
  {
    id: 'christmas',
    name: 'Christmas 2025',
    cards: [
      { id: 1, title: 'Christmas Joy', design: 'christmas-1', price: '100,000' },
      { id: 2, title: 'Winter Wonderland', design: 'christmas-2', price: '200,000' },
      { id: 3, title: 'Holiday Magic', design: 'christmas-3', price: '300,000' },
      { id: 4, title: 'Festive Cinema', design: 'christmas-4', price: '500,000' },
    ]
  },
  {
    id: 'new-collection',
    name: 'New Collection',
    cards: [
      { id: 5, title: 'Modern Cinema', design: 'new-1', price: '100,000' },
      { id: 6, title: 'Urban Style', design: 'new-2', price: '200,000' },
      { id: 7, title: 'Premium Experience', design: 'new-3', price: '300,000' },
    ]
  },
  {
    id: 'birthday',
    name: 'Birthday',
    cards: [
      { id: 8, title: 'Birthday Celebration', design: 'birthday-1', price: '100,000' },
      { id: 9, title: 'Party Time', design: 'birthday-2', price: '200,000' },
      { id: 10, title: 'Special Day', design: 'birthday-3', price: '300,000' },
    ]
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    cards: [
      { id: 11, title: 'Grateful Heart', design: 'thanks-1', price: '100,000' },
      { id: 12, title: 'Appreciation', design: 'thanks-2', price: '200,000' },
    ]
  },
  {
    id: 'congratulations',
    name: 'Congratulations',
    cards: [
      { id: 13, title: 'Success', design: 'congrats-1', price: '100,000' },
      { id: 14, title: 'Achievement', design: 'congrats-2', price: '200,000' },
    ]
  },
  {
    id: 'love',
    name: 'Love & Romance',
    cards: [
      { id: 15, title: 'Movie Date', design: 'love-1', price: '100,000' },
      { id: 16, title: 'Romantic Night', design: 'love-2', price: '200,000' },
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
  const getGradient = (design) => {
    const gradients = {
      'christmas-1': 'from-red-500 via-green-500 to-red-600',
      'christmas-2': 'from-blue-400 via-white to-blue-500',
      'christmas-3': 'from-green-600 via-red-500 to-green-700',
      'christmas-4': 'from-yellow-400 via-red-500 to-green-500',
      'new-1': 'from-primary via-secondary to-primary',
      'new-2': 'from-gray-700 via-gray-900 to-gray-800',
      'new-3': 'from-accent via-yellow-500 to-accent',
      'birthday-1': 'from-pink-400 via-purple-500 to-pink-500',
      'birthday-2': 'from-yellow-400 via-pink-500 to-purple-500',
      'birthday-3': 'from-blue-400 via-pink-400 to-purple-500',
      'thanks-1': 'from-green-400 via-teal-500 to-blue-500',
      'thanks-2': 'from-orange-400 via-red-500 to-pink-500',
      'congrats-1': 'from-yellow-400 via-orange-500 to-red-500',
      'congrats-2': 'from-purple-400 via-pink-500 to-red-500',
      'love-1': 'from-pink-500 via-red-500 to-pink-600',
      'love-2': 'from-red-400 via-pink-500 to-purple-500',
    };
    return gradients[design] || 'from-primary to-secondary';
  };

  return (
    <div className="relative aspect-[16/10] rounded-lg overflow-hidden shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(card.design)}`}></div>
      <div className="relative h-full p-6 flex flex-col justify-between text-white">
        <div>
          <p className="text-sm font-semibold mb-1">BKinema Gift Card</p>
          <h3 className="text-2xl font-bold">{card.title}</h3>
        </div>
        <div className="space-y-2">
          <div className="bg-white/20 backdrop-blur-sm rounded px-3 py-1 inline-block">
            <p className="text-xs">Card Value</p>
            <p className="text-2xl font-bold">{amount.toLocaleString()} VND</p>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="text-xs opacity-75">
            <p>Valid for 12 months</p>
            <p>Use at any BKinema</p>
          </div>
          <Icon name="film" className="w-12 h-12 opacity-50" />
        </div>
      </div>
    </div>
  );
}

export default function GiftCardPage() {
  const [selectedCategory, setSelectedCategory] = useState('christmas');
  const [selectedCard, setSelectedCard] = useState(giftCardCategories[0].cards[0]);
  const [selectedAmount, setSelectedAmount] = useState(amounts[0]);

  const currentCategory = giftCardCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">BKinema Gift Cards</h1>
          <p className="text-lg md:text-xl opacity-90">
            The perfect gift for movie lovers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary mb-6">What is a BKinema Gift Card?</h2>
            <p className="text-lg text-text-main leading-relaxed mb-6">
              BKinema Gift Cards are prepaid cards that can be used to purchase movie tickets, 
              concession items, and merchandise at all BKinema cinemas. Available as physical cards 
              or digital eGift cards, they make perfect gifts for any occasion.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Icon name="ticket" className="w-10 h-10 text-primary" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Flexible Amounts</h4>
                  <p className="text-text-sub text-sm">From 100,000 to 1,000,000 VND</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="calendar" className="w-10 h-10 text-primary" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">12 Month Validity</h4>
                  <p className="text-text-sub text-sm">Extend by topping up anytime</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎨</span>
                <div>
                  <h4 className="font-semibold text-primary mb-1">Beautiful Designs</h4>
                  <p className="text-text-sub text-sm">Multiple themes available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                    <GiftCardPreview card={card} amount={selectedAmount.value} />
                  </button>
                ))}
              </div>

              {/* Amount Selection */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-primary mb-4">Select Amount</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => setSelectedAmount(amount)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        selectedAmount.value === amount.value
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-white text-text-main hover:bg-gray-100 shadow'
                      }`}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview and Purchase */}
            <div className="bg-white rounded-lg shadow-card p-8">
              <h3 className="text-xl font-bold text-primary mb-4">Preview</h3>
              <div className="mb-6">
                <GiftCardPreview card={selectedCard} amount={selectedAmount.value} />
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
                  <span>{selectedAmount.label}</span>
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

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-lg mb-8 opacity-90">
            Contact our customer service team for assistance with gift cards
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="tel:19002312" 
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <span>📞</span>
              <span>1900 2312</span>
            </a>
            <a 
              href="mailto:support@bkinema.vn" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
            >
              <span>✉️</span>
              <span>support@bkinema.vn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
