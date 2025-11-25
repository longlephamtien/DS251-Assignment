import React from 'react';
import Icon from '../components/common/Icon';

export default function PaymentPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Payment Policy</h1>
          <p className="text-lg md:text-xl opacity-90">
            Secure and convenient payment options
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Section 1: Payment Regulation */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">1. Payment Regulation</h2>
            <p className="text-text-main leading-relaxed mb-4">
              Customers can choose the following payment methods for online booking transactions on the BKinema website:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
                <Icon name="ticket" className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">Member Reward Points</span>
              </div>
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
                <Icon name="email" className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">BKinema Gift Card</span>
              </div>
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
                <Icon name="ticket" className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">Ticket Voucher</span>
              </div>
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
                <Icon name="ticket" className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">ATM Card</span>
              </div>
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
                <Icon name="ticket" className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">Credit/Debit Card</span>
              </div>
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
                <Icon name="search" className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">International Cards</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Online Payment Methods */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">2. Online Payment Methods</h2>
            
            {/* Membership Points */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-xl font-bold text-secondary mb-3">Membership Points</h3>
              <p className="text-text-main leading-relaxed mb-3">
                1 point is equivalent to 1,000 VND. With these reward points, you can pay for all products 
                and services available at BKinema similarly to using cash.
              </p>
              <ul className="space-y-2 text-text-main ml-6">
                <li>• Minimum 20 points required for any purchase</li>
                <li>• Present membership card at box office or use online</li>
                <li>• Check points and transaction history in your account</li>
              </ul>
            </div>

            {/* Gift Card */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-xl font-bold text-secondary mb-3">BKinema Gift Card</h3>
              <p className="text-text-main leading-relaxed mb-3">
                Gift cards can be used to buy movie tickets and concession items at all BKinema cinemas and 
                for online booking.
              </p>
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-text-main">
                  <li>• Minimum balance: 100,000 VND</li>
                  <li>• Available amounts: 100,000 / 200,000 / 300,000 / 500,000 / 1,000,000 VND</li>
                  <li>• One-year validity period</li>
                  <li>• Can be topped up to extend validity</li>
                </ul>
              </div>
            </div>

            {/* ATM Cards */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-xl font-bold text-secondary mb-3">ATM Cards (Domestic)</h3>
              <p className="text-text-main leading-relaxed mb-3">
                To make online payments using domestic ATM cards, the card must be registered for internet 
                banking by the card issuer. The transaction must be successfully acknowledged by the payment 
                gateway system.
              </p>
            </div>

            {/* International Cards */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-secondary mb-3">Credit/Debit Cards (International)</h3>
              <p className="text-text-main leading-relaxed mb-3">
                We accept Visa, MasterCard, Amex, Union Pay, and JCB credit/debit cards issued by domestic 
                and international banks.
              </p>
            </div>

            {/* Ticket Voucher */}
            <div>
              <h3 className="text-xl font-bold text-secondary mb-3">Ticket Voucher</h3>
              <p className="text-text-main leading-relaxed mb-3">
                Each voucher has different validity and terms of use. Please refer carefully to the back of 
                the voucher before use. When booking online, register the voucher and PIN code before making payment.
              </p>
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-text-sub">
                  ⚠️ Ticket vouchers with scratched PIN codes are no longer valid for redemption at box office.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Accepted Cards */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">3. Accepted Cards for Online Payment</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* International Cards */}
              <div>
                <h3 className="text-lg font-bold text-secondary mb-4">International Cards</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-primary/5 p-3 rounded">
                    <span className="font-semibold text-primary">VISA</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 p-3 rounded">
                    <span className="font-semibold text-primary">MasterCard</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 p-3 rounded">
                    <span className="font-semibold text-primary">JCB</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 p-3 rounded">
                    <span className="font-semibold text-primary">American Express</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 p-3 rounded">
                    <span className="font-semibold text-primary">Union Pay</span>
                  </div>
                </div>
              </div>

              {/* Domestic Banks */}
              <div>
                <h3 className="text-lg font-bold text-secondary mb-4">Domestic ATM Cards</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-primary/5 p-3 rounded">
                    <p className="font-semibold text-primary">Vietcombank</p>
                    <p className="text-text-sub text-xs">Internet Banking + SMS Banking required</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded">
                    <p className="font-semibold text-primary">Vietinbank</p>
                    <p className="text-text-sub text-xs">Online payment service required</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded">
                    <p className="font-semibold text-primary">Techcombank</p>
                    <p className="text-text-sub text-xs">Internet banking service required</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded">
                    <p className="font-semibold text-primary">MB Bank</p>
                    <p className="text-text-sub text-xs">eMB service required</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded">
                    <p className="font-semibold text-primary">And more...</p>
                    <p className="text-text-sub text-xs">Most major Vietnamese banks supported</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Unsuccessful Transactions */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">4. Unsuccessful Transaction Payments</h2>
            <p className="text-text-main leading-relaxed mb-4">
              There are many reasons for failed transactions:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-accent mt-1">⚠️</span>
                <p className="text-text-main">
                  Card is not registered for Internet Banking services
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent mt-1">⚠️</span>
                <p className="text-text-main">
                  For Visa/MasterCard: Authentication step (Verified by Visa or MasterCard SecureCode) 
                  was not completed
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent mt-1">⚠️</span>
                <p className="text-text-main">
                  Insufficient balance for payment or exceeded daily spending limit
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent mt-1">⚠️</span>
                <p className="text-text-main">
                  Incorrect card number or payment information
                </p>
              </div>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mt-6">
              <p className="font-semibold text-primary mb-2">Need Help?</p>
              <p className="text-text-main text-sm">
                Please contact hotline <a href="tel:19002312" className="text-secondary font-semibold">1900 2312</a> or 
                your card issuer bank for accurate explanation and support.
              </p>
            </div>
          </div>
        </section>

        {/* Security Notice */}
        <section>
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icon name="lock" className="w-6 h-6" />
              <span>Payment Security</span>
            </h2>
            <p className="mb-6 opacity-90 leading-relaxed">
              BKinema ensures the security of your information and uses the best privacy solutions for payments. 
              All personal information and payment details are encrypted to ensure maximum safety.
            </p>
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="font-bold mb-3">Security Tips:</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Only make online payments on official BKinema website</li>
                <li>• Use and preserve your card information carefully</li>
                <li>• Do not share your membership card or CVV/CVC numbers</li>
                <li>• Check your bank account regularly for unauthorized transactions</li>
                <li>• Contact us immediately if you detect any unusual transactions</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
