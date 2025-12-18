import React from 'react';
import Icon from '../components/common/Icon';

export default function MembershipPage() {
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
                BKINEMA MEMBERSHIP
              </span>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-0" />
            </h2>
          </div>
          <p className="text-center text-text-sub">
            Unlock exclusive benefits and rewards
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary mb-6">What is BKinema Membership?</h2>
            <p className="text-lg text-text-main leading-relaxed mb-4">
              The BKinema membership program is designed to bring our loyal customers an array 
              of special offers, resulting in once-in-a-lifetime experiences that are both 
              enriching and meaningful.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="flex items-start gap-3">
                <Icon name="check" className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Book Online Anytime</h4>
                  <p className="text-text-sub">Book movie tickets online 24/7 from anywhere</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="check" className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Birthday Gifts</h4>
                  <p className="text-text-sub">Free tickets and combos on your special day</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="check" className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Exclusive Offers</h4>
                  <p className="text-text-sub">Special discounts and promotions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="check" className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Weekly Newsletter</h4>
                  <p className="text-text-sub">Latest movie news delivered to your inbox</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Membership Levels */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Membership Levels</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* U22 */}
            <div className="bg-white rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">U22</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">U22 Member</h3>
                <p className="text-sm text-text-sub">Under 22 years old</p>
              </div>
              <div className="border-t pt-4 space-y-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-text-sub">Box Office:</span>
                  <span className="font-semibold text-primary">5%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-sub">Concession:</span>
                  <span className="font-semibold text-primary">3%</span>
                </p>
                <div className="pt-3 border-t">
                  <p className="font-semibold text-primary mb-2">Birthday Gift:</p>
                  <p className="text-text-sub text-xs">1 Free Combo</p>
                  <p className="text-text-sub text-xs">+ 1 Free Ticket (on 23rd birthday)</p>
                </div>
              </div>
            </div>

            {/* Member */}
            <div className="bg-white rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Icon name="user" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Member</h3>
                <p className="text-sm text-text-sub">Standard membership</p>
              </div>
              <div className="border-t pt-4 space-y-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-text-sub">Box Office:</span>
                  <span className="font-semibold text-primary">5%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-sub">Concession:</span>
                  <span className="font-semibold text-primary">3%</span>
                </p>
                <div className="pt-3 border-t">
                  <p className="font-semibold text-primary mb-2">Birthday Gift:</p>
                  <p className="text-text-sub text-xs">1 Free Combo</p>
                </div>
              </div>
            </div>

            {/* VIP */}
            <div className="bg-white rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow border-2 border-accent">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Icon name="crown" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-accent mb-2">VIP</h3>
                <p className="text-sm text-text-sub">Premium benefits</p>
              </div>
              <div className="border-t pt-4 space-y-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-text-sub">Box Office:</span>
                  <span className="font-semibold text-accent">7%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-sub">Concession:</span>
                  <span className="font-semibold text-accent">4%</span>
                </p>
                <div className="pt-3 border-t">
                  <p className="font-semibold text-accent mb-2">Birthday Gift:</p>
                  <p className="text-text-sub text-xs">1 Free Combo</p>
                  <p className="text-text-sub text-xs">+ 1 Free 2D/3D Ticket</p>
                </div>
              </div>
            </div>

            {/* VVIP */}
            <div className="bg-white rounded-lg shadow-card p-6 hover:shadow-lg transition-shadow border-2 border-secondary">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Icon name="diamond" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">VVIP</h3>
                <p className="text-sm text-text-sub">Elite membership</p>
              </div>
              <div className="border-t pt-4 space-y-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-text-sub">Box Office:</span>
                  <span className="font-semibold text-secondary">10%</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-sub">Concession:</span>
                  <span className="font-semibold text-secondary">5%</span>
                </p>
                <div className="pt-3 border-t">
                  <p className="font-semibold text-secondary mb-2">Birthday Gift:</p>
                  <p className="text-text-sub text-xs">1 Free Combo</p>
                  <p className="text-text-sub text-xs">+ 2 Free 2D/3D Tickets</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loyalty Points */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary mb-6">Loyalty Points</h2>
            <p className="text-lg text-text-main leading-relaxed mb-6">
              Every time you spend at BKinema, your spending will be converted to points. 
              1 point = 1,000 VND, equivalent to cash, which can be redeemed for drinks, 
              combos, and movie tickets.
            </p>
            
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-primary mb-4">How to Earn Points</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <p className="text-text-main">Box office purchases: 5-10% based on membership level</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <p className="text-text-main">Concession purchases: 3-5% based on membership level</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-secondary rounded-full"></span>
                  <p className="text-text-main">Points recorded automatically for online bookings</p>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
              <h4 className="text-xl font-bold text-primary mb-4">Important Notes:</h4>
              <div className="space-y-3"> 
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    <p className="text-text-main">Points expire after 1 year from earning date</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    <p className="text-text-main">Minimum 20 points required for redemption</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    <p className="text-text-main">Maximum 10 transactions per day for point accumulation</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    <p className="text-text-main">Online payments: points can pay up to 90% of transaction value</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    <p className="text-text-main">Present your membership card at counter to record points</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
            <p className="text-lg mb-6 opacity-90">
              Sign up now and start enjoying exclusive benefits
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a 
                href="/register" 
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Register Now
              </a>
              <a 
                href="/login" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-block"
              >
                Sign In
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
