import React from 'react';
import Icon from './common/Icon';
import logoLarge from '../assets/bkinema-logo-large.png';
import logoSmall from '../assets/bkinema-logo-small.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white mt-auto text-[14px]">
      {/* Cinema Brands Footer */}
      <div className="bg-white border-t border-b border-gray-800">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-60 text-xl font-bold">
            <span className="text-gray-400">IMAX</span>
            <span className="text-yellow-600">STARIUM</span>
            <span className="text-gray-500">GOLDCLASS</span>
            <span className="text-gray-600">L'AMOUR</span>
            <span className="text-orange-500">SWEETBOX</span>
            <span className="text-blue-600">CINE & LIVING ROOM</span>
            <span className="text-gray-700">4DX</span>
            <span className="text-purple-600">SCREENX</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <img 
                src={logoSmall} 
                alt="BKinema Logo" 
                className="h-8 md:hidden"
              />
              <img 
                src={logoLarge} 
                alt="BKinema Logo" 
                className="h-10 hidden md:block"
              />
            </div>
            <p className="text-[14px] mb-4 leading-relaxed">
              Your premier destination for the latest movies and exceptional cinema experience. 
              Book your tickets online for a seamless movie-going experience.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3 mt-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-gray-700 hover:text-white"
                aria-label="Facebook"
              >
                <Icon name="facebook" className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-gray-700 hover:text-white"
                aria-label="Twitter"
              >
                <Icon name="twitter" className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-gray-700 hover:text-white"
                aria-label="Instagram"
              >
                <Icon name="instagram" className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-gray-700 hover:text-white"
                aria-label="YouTube"
              >
                <Icon name="youtube" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 uppercase text-[14px] tracking-wide">Movies</h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href="/movies/now-showing" className="hover:text-primary transition-colors">
                  Now Showing
                </a>
              </li>
              <li>
                <a href="/movies/special-events" className="hover:text-primary transition-colors">
                  Special Events
                </a>
              </li>
              <li>
                <a href="/theaters" className="hover:text-primary transition-colors">
                  Find a Theater
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Services */}
          <div>
            <h4 className="font-semibold mb-4 uppercase text-[14px] tracking-wide">Support & Services</h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href="/membership" className="hover:text-primary transition-colors">
                  Membership
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-primary transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/gift-cards" className="hover:text-primary transition-colors">
                  Gift Cards
                </a>
              </li>
              <li>
                <a href="/vouchers" className="hover:text-primary transition-colors">
                  Vouchers
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-semibold mb-4 uppercase text-[14px] tracking-wide">Contact</h4>
            <ul className="space-y-2 text-[14px]">
              <li className="flex items-start gap-2">
                <Icon name="location" className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>268 Ly Thuong Kiet, District 10, Ho Chi Minh City</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="phone" className="w-4 h-4 flex-shrink-0" />
                <a href="tel:19002312" className="hover:text-primary transition-colors">
                  1900 2312
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="email" className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@bkinema.vn" className="hover:text-primary transition-colors">
                  support@bkinema.vn
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h5 className="font-semibold mb-2 text-[14px]">Legal</h5>
              <ul className="space-y-1 text-[14px]">
                <li>
                  <a href="/terms" className="hover:text-primary transition-colors">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="/payment-policy" className="hover:text-primary transition-colors">
                    Payment Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[14px] text-gray-400">
            <div>
              © {currentYear} BKinema. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="/about" className="hover:text-white transition-colors">
                About Us
              </a>
              <a href="/careers" className="hover:text-white transition-colors">
                Careers
              </a>
              <a href="/advertise" className="hover:text-white transition-colors">
                Advertise
              </a>
              <a href="/partners" className="hover:text-white transition-colors">
                Partners
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
