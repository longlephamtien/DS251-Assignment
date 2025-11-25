import React, { useState } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import logoLarge from '../assets/bkinema-logo-large.png';
import logoSmall from '../assets/bkinema-logo-small.png';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Top Language / Utility Bar */}
      <div className="bg-gray-800 text-[14px] font-sans">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-8">
          <div />
          <div className="flex items-center gap-4 text-gray-300">
            <a href="/news" className="hover:text-white transition-colors">News & Offers</a>
            <a href="/my-tickets" className="hover:text-white transition-colors">My Tickets</a>
            <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
              <button className="font-semibold text-white">EN</button>
              <span className="text-gray-500">|</span>
              <button className="opacity-80 hover:text-white transition-colors">VN</button>
            </div>
            <a href="/customer" className="hover:text-white transition-colors border-l border-gray-600 pl-4 flex items-center">
              <Icon name="user" className="inline-block w-4 h-4" />
              <span className="ml-1 hidden md:inline">Account</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <img 
                src={logoSmall} 
                alt="BKinema Logo" 
                className="h-10 md:hidden"
              />
              <img 
                src={logoLarge} 
                alt="BKinema Logo" 
                className="h-12 hidden md:block"
              />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-6 uppercase text-[14px] font-semibold tracking-wide">
                <li>
                  <a href="/movies" className="hover:text-primary transition-colors py-2">
                    Movies
                  </a>
                </li>

                <li>
                  <a href="/theaters" className="hover:text-primary transition-colors py-2">
                    Theaters
                  </a>
                </li>

                <li>
                  <a href="/membership" className="hover:text-primary transition-colors py-2">
                    Membership
                  </a>
                </li>

                <li className="group relative">
                  <a href="/services" className="hover:text-primary transition-colors py-2">
                    Services
                  </a>
                  <div className="hidden group-hover:block absolute left-0 top-full pt-2">
                    <ul className="bg-white border border-gray-200 shadow-lg rounded-md min-w-[220px] py-2 text-[14px]">
                      <li>
                        <a href="/gift" className="block px-4 py-2 hover:bg-background transition-colors">
                          Gift Cards
                        </a>
                      </li>
                      <li>
                        <a href="/vouchers" className="block px-4 py-2 hover:bg-background transition-colors">
                          Vouchers & Coupons
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Search & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              {/* Search Button */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-background rounded-full transition-colors"
                aria-label="Search"
              >
                <Icon name="search" className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-background rounded-md transition-colors"
                aria-label="Menu"
              >
                <Icon name={mobileMenuOpen ? "close" : "menu"} className="w-6 h-6" />
              </button>

              {/* Book Tickets CTA */}
              <Button 
                href="/book" 
                variant="primary" 
                className="hidden md:inline-flex"
              >
                Book Tickets
              </Button>
            </div>
          </div>

          {/* Search Bar (Expandable) */}
          {searchOpen && (
            <div className="py-4 border-t">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search movies, theaters..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="max-w-[1200px] mx-auto px-4 py-4">
              <ul className="space-y-4 text-[14px]">
                <li>
                  <a href="/movies/now-showing" className="block font-semibold hover:text-primary">Movies</a>
                </li>
                <li>
                  <a href="/theaters/all" className="block font-semibold hover:text-primary">Theaters</a>
                </li>
                <li>
                  <a href="/membership" className="block font-semibold hover:text-primary">Membership</a>
                </li>
                <li>
                  <a href="/services" className="block font-semibold hover:text-primary">Services</a>
                  <ul className="ml-4 mt-2 space-y-2 text-[14px]">
                    <li><a href="/services/gift-cards" className="block text-text-sub hover:text-primary">Gift Cards</a></li>
                    <li><a href="/services/vouchers" className="block text-text-sub hover:text-primary">Vouchers & Coupons</a></li>
                  </ul>
                </li>
              </ul>
              <div className="mt-6">
                <Button href="/book" variant="primary" className="w-full">
                  Book Tickets
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
