import React, { useState } from 'react';
import { authService } from '../services';
import Button from './common/Button';
import Icon from './common/Icon';
import logoLarge from '../assets/bkinema-logo-large.png';
import logoSmall from '../assets/bkinema-logo-small.png';

const HEADER_TEXT = {
  en: {
    newsOffers: 'News & Offers',
    myTickets: 'My Tickets',
    hi: 'Hi',
    account: 'Account',
    logout: 'Logout',
    movies: 'Movies',
    theaters: 'Theaters',
    membership: 'Membership',
    services: 'Services',
    giftCards: 'Gift Cards',
    vouchersCoupons: 'Vouchers & Coupons',
    searchAria: 'Search',
    menuAria: 'Menu',
    bookTickets: 'Book Tickets',
    searchPlaceholder: 'Search movies, theaters...',
  },
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const accountUrl = isAuthenticated ? '/customer' : '/login';
  const myTicketsUrl = isAuthenticated ? '/my-tickets' : '/login';
  const currentUser = authService.getCurrentUser();
  const t = HEADER_TEXT.en;

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Top Language / Utility Bar */}
      <div className="bg-gray-800 text-[14px] font-sans">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-8">
          <div />
          <div className="flex items-center gap-4 text-gray-300">
            <a href="/news" className="hover:text-white transition-colors">{t.newsOffers}</a>
            <a href={myTicketsUrl} className="hover:text-white transition-colors">{t.myTickets}</a>
            {isAuthenticated ? (
              <>
                <a href={accountUrl} className="hover:text-white transition-colors border-l border-gray-600 pl-4 flex items-center">
                  <Icon name="user" className="inline-block w-4 h-4" />
                  <span className="ml-1 hidden md:inline">
                    {t.hi}, {currentUser?.fname || t.account}
                  </span>
                </a>
                <button 
                  onClick={handleLogout}
                  className="hover:text-white transition-colors flex items-center"
                >
                  <Icon name="log-out" className="inline-block w-4 h-4" />
                  <span className="ml-1 hidden md:inline">{t.logout}</span>
                </button>
              </>
            ) : (
              <a href={accountUrl} className="hover:text-white transition-colors border-l border-gray-600 pl-4 flex items-center">
                <Icon name="user" className="inline-block w-4 h-4" />
                <span className="ml-1 hidden md:inline">{t.account}</span>
              </a>
            )}
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
                    {t.movies}
                  </a>
                </li>

                <li>
                  <a href="/theaters" className="hover:text-primary transition-colors py-2">
                    {t.theaters}
                  </a>
                </li>

                <li>
                  <a href="/membership" className="hover:text-primary transition-colors py-2">
                    {t.membership}
                  </a>
                </li>

                <li className="group relative">
                  <a href="/gift-cards" className="hover:text-primary transition-colors py-2">
                    {t.services}
                  </a>
                  <div className="hidden group-hover:block absolute left-0 top-full pt-2">
                    <ul className="bg-white border border-gray-200 shadow-lg rounded-md min-w-[220px] py-2 text-[14px]">
                      <li>
                        <a href="/gift-cards" className="block px-4 py-2 hover:bg-background transition-colors">
                          {t.giftCards}
                        </a>
                      </li>
                      <li>
                        <a href="/vouchers" className="block px-4 py-2 hover:bg-background transition-colors">
                          {t.vouchersCoupons}
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
                aria-label={t.searchAria}
              >
                <Icon name="search" className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-background rounded-md transition-colors"
                aria-label={t.menuAria}
              >
                <Icon name={mobileMenuOpen ? "close" : "menu"} className="w-6 h-6" />
              </button>

              {/* Book Tickets CTA */}
              <Button 
                href="/movies/now-showing" 
                variant="primary" 
                className="hidden md:inline-flex"
              >
                {t.bookTickets}
              </Button>
            </div>
          </div>

          {/* Search Bar (Expandable) */}
          {searchOpen && (
            <div className="py-4 border-t">
              <div className="relative">
                <input 
                  type="text"
                  placeholder={t.searchPlaceholder}
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
                  <a href="/movies/now-showing" className="block font-semibold hover:text-primary">{t.movies}</a>
                </li>
                <li>
                  <a href="/theaters/all" className="block font-semibold hover:text-primary">{t.theaters}</a>
                </li>
                <li>
                  <a href="/membership" className="block font-semibold hover:text-primary">{t.membership}</a>
                </li>
                <li>
                  <a href="/gift-cards" className="block font-semibold hover:text-primary">{t.services}</a>
                  <ul className="ml-4 mt-2 space-y-2 text-[14px]">
                    <li><a href="/gift-cards" className="block text-text-sub hover:text-primary">{t.giftCards}</a></li>
                    <li><a href="/vouchers" className="block text-text-sub hover:text-primary">{t.vouchersCoupons}</a></li>
                  </ul>
                </li>
              </ul>
              <div className="mt-6">
                <Button href="/movies/now-showing" variant="primary" className="w-full">
                  {t.bookTickets}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
