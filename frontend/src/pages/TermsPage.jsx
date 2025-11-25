import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Use</h1>
          <p className="text-lg md:text-xl opacity-90">
            Please read these terms carefully before using our services
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <p className="text-text-main leading-relaxed mb-4">
              Welcome to BKinema. Our company is BKinema Vietnam, located at 268 Ly Thuong Kiet Street, 
              District 10, Ho Chi Minh City, Vietnam.
            </p>
            <p className="text-text-main leading-relaxed mb-4">
              Once you visit our website or use our services, it means that you have agreed with these terms. 
              This website is entitled to change, edit, add and remove any part of Terms and Conditions at any time. 
              The changes will come into effect as soon as they are posted on the website without any announcements in advance.
            </p>
            <p className="text-text-main leading-relaxed">
              Please check regularly for our updates.
            </p>
          </div>
        </section>

        {/* Section 1 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-4">1. Scope of Application</h2>
            <p className="text-text-main leading-relaxed">
              This section applies specifically to the booking function available on this website. When using 
              online booking function to buy tickets, you signify your agreement to all applicable terms, 
              conditions, and notices, including but not limited to the Terms of Use. If this is not your 
              intention and/or you disagree with any part of applicable terms and conditions, DO NOT USE this facility.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-4">2. Account Conditions</h2>
            <p className="text-text-main leading-relaxed mb-4">
              You must register an account with real information and update if there are any changes. Each visitor 
              is responsible for their password, account and activity on the website. Furthermore, you must notify 
              us when your account is accessed without permission.
            </p>
            <p className="text-text-main leading-relaxed">
              We do not accept any responsibility, whether direct or indirect, for any loss or damage caused by 
              your non-compliance.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">3. Regulations for Online Booking</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-secondary mt-1">•</span>
                <p className="text-text-main">
                  The function of booking online tickets only applies for BKinema members. For details about 
                  BKinema member registration, please visit our membership page.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary mt-1">•</span>
                <p className="text-text-main">
                  Typically, BKinema opens online booking before a movie's release date, though this depends 
                  on each movie and cinema. If the showtime you want is not displayed on the website, please 
                  check back later or contact our hotline 1900 2312 for more information.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary mt-1">•</span>
                <p className="text-text-main">
                  The close time of buying online tickets is 30 minutes before showtime or when a session is 
                  sold out. After this time you can come to the cinema to buy tickets directly.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary mt-1">•</span>
                <p className="text-text-main">
                  BKinema is not committed to reserve your seat until you complete the payment for your order.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary mt-1">•</span>
                <p className="text-text-main">
                  Customers can book a maximum of 8 tickets (excluding children tickets) per showtime.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary mt-1">•</span>
                <p className="text-text-main">
                  You will receive a booking number confirmation via email and SMS. The booking confirmation 
                  email might go into your spam mailbox, please check it before contacting BKinema.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">4. Pricing</h2>
            <div className="space-y-4">
              <p className="text-text-main">
                The price listed on BKinema website is the final price that includes Value Added Tax (VAT). 
                Ticket prices may change depending on period and promotions, and will be clearly displayed on 
                the payment page.
              </p>
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mt-4">
                <h3 className="font-bold text-primary mb-3">Age Classification System:</h3>
                <ul className="space-y-2 text-sm text-text-main">
                  <li><strong>P:</strong> All ages permitted</li>
                  <li><strong>K:</strong> Under 13 with parent/guardian</li>
                  <li><strong>C13 (T13):</strong> 13 years and over</li>
                  <li><strong>C16 (T16):</strong> 16 years and over</li>
                  <li><strong>C18 (T18):</strong> 18 years and over</li>
                </ul>
                <p className="text-sm text-text-sub mt-3">
                  Please bring valid identification to verify age requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-6">5. Transaction Value and Payment Methods</h2>
            <p className="text-text-main mb-4">
              Customers can choose the following payment methods on BKinema:
            </p>
            <ul className="space-y-2 text-text-main ml-6">
              <li>• Member Reward Points</li>
              <li>• BKinema Gift Card</li>
              <li>• Ticket Voucher</li>
              <li>• ATM Card (debit/payment/prepaid cards)</li>
              <li>• Credit card, debit card, international prepaid card</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-4">6. Cancellation and Refund Policy</h2>
            <p className="text-text-main leading-relaxed mb-4">
              BKinema does not currently support the cancellation or change of paid ticketing information.
            </p>
            <p className="text-text-main leading-relaxed mb-4">
              We will only refund money in case your account has been deducted, but our system does not recognize 
              the booking, and you do not receive confirmation of your booking. Please contact hotline 1900 2312 
              or email support@bkinema.vn for support.
            </p>
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-text-main">
                <strong>Refund Timeline:</strong>
              </p>
              <ul className="text-sm text-text-sub mt-2 space-y-1">
                <li>• ATM Card (Domestic): Within 8 working days</li>
                <li>• VISA/MasterCard (Domestic): Within 10 working days</li>
              </ul>
              <p className="text-xs text-text-sub mt-2">
                * Excluding Saturdays, Sundays, and Public Holidays
              </p>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-4">7. Copyright and Brand</h2>
            <p className="text-text-main leading-relaxed">
              All intellectual ownership (registered or not), all contents and designs, graphics, software, 
              images, sounds, software programming, source code and basic software are our assets. The whole 
              contents are protected by Vietnamese copyright law and international conventions. All copyrights 
              are reserved.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-4">8. Security Regulations</h2>
            <p className="text-text-main leading-relaxed mb-4">
              Our application ensures the security of information and uses the best privacy solutions for payments. 
              Personal information of customers during the payment process is encrypted to ensure safety.
            </p>
            <p className="text-text-main leading-relaxed">
              You must not use any programs, tools, or methods to interfere with the system or change the data 
              structure. All transaction information will be secured, and we will be required to provide information 
              to authorized bodies if requested.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-4">9. Applicable Law and Dispute Resolution</h2>
            <p className="text-text-main leading-relaxed">
              The conditions, terms, and contents on the website are enforced by Vietnamese Law, and Vietnamese 
              courts will give final judgment should there be any disputes arising from the use of this website.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Need More Information?</h2>
            <p className="mb-6 opacity-90">
              If you need more information or have questions about our terms, please visit our FAQ page or contact us.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a 
                href="/faq" 
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                View FAQ
              </a>
              <a 
                href="/contact" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-block"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
