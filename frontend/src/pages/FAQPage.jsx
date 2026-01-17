import React, { useState } from 'react';
import Icon from '../components/common/Icon';

const faqData = [
  {
    category: 'Movies',
    icon: 'film',
    questions: [
      {
        q: 'What is P, C13, C16, C18?',
        a: `P: Movies are allowed to be disseminated to viewers of all ages.
K: Movies are disseminated to viewers under the age of 13 provided they are watched with a parent or guardian.
C13 (T13): Movies are allowed to be disseminated to viewers aged 13 years and over (13+).
C16 (T16): Movies are allowed to be disseminated to viewers aged 16 years and over (16+).
C18 (T18): Movies are allowed to be disseminated to viewers aged 18 years and over (18+).

Customers please kindly bring identification card or image with clearly visible photo and date of birth to ensure compliance with age restrictions. BKinema has the right to refuse selling tickets or stop customers entering the theatre if customers fail to follow the announced terms.`
      },
      {
        q: 'What is an Early Release?',
        a: 'Early Release allows viewers to watch blockbuster movies before the official release date. This special screening is typically available for highly anticipated films and may have limited showtimes and theaters.'
      },
      {
        q: 'What is a Sneak Show?',
        a: 'A Sneak Show is a special advance screening of a movie before its official release date. These screenings are often held for promotional purposes and give audiences an exclusive first look at upcoming films.'
      }
    ]
  },
  {
    category: 'Membership Program',
    icon: 'star',
    questions: [
      {
        q: 'What is BKinema membership program?',
        a: `The BKinema membership program is designed to bring our loyal customers an array of special offers and meaningful experiences. With BKinema membership you can:

• Book movie tickets online
• Get free movie tickets/concession combos on your birthday
• Enjoy special offers and discounts
• Receive our weekly movie newsletter
• Share your opinions of movies
• Connect to the greater movie-lover community`
      },
      {
        q: 'How to apply for BKinema membership?',
        a: 'You can register for BKinema membership online through our website or mobile app, or visit any BKinema cinema counter with a valid ID. Registration is free and takes only a few minutes. You\'ll need to provide your name, email, phone number, and date of birth.'
      },
      {
        q: 'Is there an expiration date for BKinema membership card?',
        a: 'BKinema membership cards do not expire as long as you remain active. However, your membership tier (Member, VIP, VVIP) is reviewed annually based on your total spending. Reward points expire after 1 year from the date they were earned.'
      },
      {
        q: 'If I forget my member card, can I receive reward points?',
        a: 'Yes, you can still earn reward points by providing your registered phone number or email address at the counter. For online bookings, points are automatically recorded when you log in with your account.'
      }
    ]
  },
  {
    category: 'Reward Points',
    icon: 'diamond',
    questions: [
      {
        q: 'What are membership points (reward points)?',
        a: `Each time you spend at BKinema Cinemas, your spending will be converted to points accordingly:

• At ticket counter: Member/U22: 5% | VIP: 7% | VVIP: 10%
• At concession counter: Member/U22: 3% | VIP: 4% | VVIP: 5%

You should present your membership card prior to making payment at counter to record your points. When buying tickets online, the membership points are recorded automatically after payment is completed.`
      },
      {
        q: 'How do I use my points?',
        a: '1 point = 1,000 VND. You can use your reward points to pay for movie tickets, concession items, or combos. Minimum 20 points required for redemption. Present your membership card at the counter or use them during online checkout. For online payments, points can cover up to 90% of the transaction value.'
      },
      {
        q: 'What is the expiry date of reward points?',
        a: 'Reward points expire after 1 year from the earning date. For example, if you earn points on January 5, 2024 at 8 AM, they will expire on January 5, 2025 at 8 AM. Please check your account regularly to track your points and their expiry dates.'
      },
      {
        q: 'Can I purchase online using points?',
        a: 'Yes, you can use your reward points for online ticket purchases on the BKinema website or app. You\'ll need to log in to your membership account. Points can be used to pay up to 90% of your online transaction value, with a minimum redemption of 20 points.'
      }
    ]
  },
  {
    category: 'Birthday Gifts',
    icon: 'cake',
    questions: [
      {
        q: 'What are BKinema birthday gifts?',
        a: `It's the birthday celebration gift from BKinema, exclusively for our members. Gifts vary by membership level:

1. U22: 1 free Combo (1 Popcorn & 2 Drinks). On 23rd birthday, get 1 free 2D/3D ticket.
2. Member: 1 free Combo (1 Popcorn & 2 Drinks).
3. VIP: 1 free Combo + 1 free 2D/3D ticket.
4. VVIP: 1 free Combo + 2 free 2D/3D tickets.`
      },
      {
        q: 'When can I redeem my birthday gift from BKinema?',
        a: 'Birthday gifts can be redeemed during your birthday month. You\'ll receive a notification via email and SMS with instructions on how to claim your gift. The gift must be redeemed within the birthday month and cannot be extended or carried over.'
      },
      {
        q: 'How can I redeem my birthday gift?',
        a: 'You can redeem your birthday gift at any BKinema cinema by presenting your membership card and valid ID at the counter. For online redemption, log in to your account and the birthday gift will appear as an available voucher during checkout.'
      }
    ]
  },
  {
    category: 'Online Booking',
    icon: 'computer',
    questions: [
      {
        q: 'How do I book tickets online?',
        a: `To purchase tickets online, you need a BKinema member account. Here are the steps:

Step 1: Log in with your BKinema account on the website or app
Step 2: Select the movie, theater, showtime, and seats
Step 3: Agree to terms and confirm payment (you have 5 minutes to complete)
Step 4: Receive booking code via email and SMS

The online ticket system closes 30 minutes before showtime.`
      },
      {
        q: 'How can I get the tickets after finishing booking online?',
        a: 'After completing your online booking, you\'ll receive a booking confirmation code via email and SMS. Present this booking code at the cinema counter to collect your physical tickets. You can also show the QR code from your email or app at the self-service kiosk.'
      },
      {
        q: 'Can we get a refund for unused tickets?',
        a: 'BKinema does not currently support cancellations or refunds for purchased tickets. We only provide refunds in cases where payment was deducted but no booking confirmation was received. Please double-check your booking details before completing payment.'
      },
      {
        q: 'My bank account is deducted but I haven\'t received booking number confirmation, what should I do?',
        a: 'Please contact our hotline 1900 2312 (8:00-22:00 daily) or email support@bkinema.vn with your transaction details. Depending on your payment method, refunds typically take 8-10 working days for domestic cards (excluding weekends and holidays).'
      }
    ]
  },
  {
    category: 'Gift Cards & Vouchers',
    icon: 'gift',
    questions: [
      {
        q: 'What is BKinema Gift Card?',
        a: `BKinema Gift Card is a prepaid card used for purchasing tickets, merchandise, and F&B at BKinema cinemas. Key features:

• Available both as physical cards and eGift (digital)
• Starting from 100,000 VND
• 12-month validity from activation
• Can be topped up with minimum 50,000 VND
• Multiple colorful designs available
• Perfect for gifts and rewards`
      },
      {
        q: 'Can I accumulate points with gift cards?',
        a: 'Saving points and total spending are applied only for the gift card user, not the purchaser. When using a gift card for purchases at BKinema, points will be accumulated to the membership account of the person using the card.'
      },
      {
        q: 'What if there is remaining balance when my gift card expires?',
        a: 'You can extend your gift card\'s expiry date by topping it up with a minimum amount of 50,000 VND at any BKinema counter or through our app. We recommend topping up before expiration to avoid losing your remaining balance.'
      }
    ]
  },
  {
    category: 'Concessions',
    icon: 'food',
    questions: [
      {
        q: 'Is food and drinks bought outside BKinema allowed in-theatre?',
        a: 'To ensure hygiene and safety, only food and beverages purchased at BKinema can be consumed in the cinema. Also, no smoking, chewing gum, filming, photographing, chatting, or using cell phones inside the cinema. These rules ensure maximum comfort for all customers.'
      },
      {
        q: 'How many popcorn flavors are there at BKinema?',
        a: 'BKinema offers various popcorn flavors including Sweet, Salted, Cheese, and Caramel. Availability may vary by location. We use butterfly popcorn for the best texture and taste.'
      },
      {
        q: 'Can I upgrade the size of popcorn and drink in concession combos?',
        a: 'Yes, you can upgrade the size of popcorn and drinks in most combo packages for an additional fee. Please ask our staff at the concession counter for upgrade options and pricing.'
      }
    ]
  }
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-white hover:bg-background transition-colors flex items-center justify-between"
      >
        <span className="font-semibold text-primary pr-8">{question}</span>
        <Icon 
          name="chevronDown" 
          className={`w-6 h-6 text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-background border-t border-gray-200">
          <p className="text-text-main leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

function FAQCategory({ category, icon, questions }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Icon name={icon} className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-primary">{category}</h2>
      </div>
      <div>
        {questions.map((item, index) => (
          <FAQItem key={index} question={item.q} answer={item.a} />
        ))}
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg md:text-xl opacity-90">
            Find answers to common questions about BKinema
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-[1200px] mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-main"
            />
            <Icon name="search" className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((category, index) => (
            <FAQCategory
              key={index}
              category={category.category}
              icon={category.icon}
              questions={category.questions}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Icon name="search" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-text-sub">No questions found matching your search.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-secondary hover:text-primary font-semibold"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our customer service team is here to help you
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-sm opacity-75">Hotline</p>
                  <a href="tel:19002312" className="text-xl font-bold hover:underline">
                    1900 2312
                  </a>
                </div>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/30"></div>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-sm opacity-75">Email</p>
                  <a href="mailto:support@bkinema.vn" className="text-xl font-bold hover:underline">
                    support@bkinema.vn
                  </a>
                </div>
              </div>
              <div className="hidden md:block w-px h-12 bg-white/30"></div>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-sm opacity-75">Working Hours</p>
                  <p className="text-xl font-bold">8:00 - 22:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
