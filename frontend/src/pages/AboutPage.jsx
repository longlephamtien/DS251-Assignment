import React from 'react';
import Icon from '../components/common/Icon';

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About BKinema</h1>
          <p className="text-lg md:text-xl opacity-90">
            Your Premier Cinema Experience in Vietnam
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Mission Statement */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary mb-6">Our Mission</h2>
            <p className="text-lg text-text-main leading-relaxed mb-4">
              BKinema is one of the leading cinema operators in Vietnam, committed to delivering 
              exceptional movie-going experiences to our valued customers.
            </p>
            <p className="text-lg text-text-main leading-relaxed mb-4">
              Our mission is to become a role model company for the continuous development of the 
              film industry in Vietnam, bringing world-class entertainment to every community.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-card p-8">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Icon name="film" className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">World-Class Technology</h3>
              <p className="text-text-main leading-relaxed">
                We implement the latest cinema technology including IMAX, 4DX, Dolby Atmos, 
                and premium seating options to provide our customers with the most immersive 
                movie experience possible.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-card p-8">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Icon name="ticket" className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Premium Concessions</h3>
              <p className="text-text-main leading-relaxed">
                Enjoy our diverse selection of food and beverages, from classic popcorn and 
                drinks to gourmet snacks and meal combos, all prepared fresh for your enjoyment.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-card p-8">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Icon name="search" className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Exceptional Service</h3>
              <p className="text-text-main leading-relaxed">
                Our professionally trained staff is dedicated to providing the highest quality 
                service, ensuring every visit to BKinema is comfortable, convenient, and memorable.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-card p-8">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Icon name="building" className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Community Engagement</h3>
              <p className="text-text-main leading-relaxed">
                We actively support the Vietnamese film industry through various initiatives, 
                including film festivals, emerging filmmaker programs, and special community 
                screening events.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-card h-full">
                  <Icon name="target" className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="text-xl font-bold text-primary mb-3">Excellence</h4>
                  <p className="text-text-sub">
                    Delivering the highest standards in every aspect of our service
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-card h-full">
                  <Icon name="handshake" className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="text-xl font-bold text-primary mb-3">Partnership</h4>
                  <p className="text-text-sub">
                    Building strong relationships with customers, partners, and filmmakers
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-card h-full">
                  <Icon name="rocket" className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="text-xl font-bold text-primary mb-3">Innovation</h4>
                  <p className="text-text-sub">
                    Continuously improving and adopting new technologies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section>
          <div className="bg-white rounded-lg shadow-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-primary mb-6">Contact Us</h2>
            <div className="space-y-4 text-text-main">
              <p className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Address:</span>
                <span>268 Ly Thuong Kiet Street, District 10, Ho Chi Minh City, Vietnam</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Working Hours:</span>
                <span>9:00 - 17:00 (Monday to Friday, excluding Public Holidays)</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Hotline:</span>
                <a href="tel:19002312" className="text-secondary hover:text-primary transition-colors">
                  1900 2312
                </a>
              </p>
              <p className="flex items-start gap-3">
                <span className="font-semibold min-w-[120px]">Email:</span>
                <a href="mailto:support@bkinema.vn" className="text-secondary hover:text-primary transition-colors">
                  support@bkinema.vn
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
