import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { BookingProvider } from './context/BookingContext';
import {
  HomePage,
  AboutPage,
  MembershipPage,
  TermsPage,
  PaymentPolicyPage,
  FAQPage,
  MoviesPage,
  TheatersPage,
  GiftCardPage,
  MovieDetailPage,
  BookingPage,
  ComboPage,
  PaymentPage,
  CustomerPage,
  LoginPage,
  RegisterPage
} from './pages';

function App() {
  return (
    <Router>
      <BookingProvider>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/payment-policy" element={<PaymentPolicyPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/now-showing" element={<MoviesPage />} />
              <Route path="/movies/:slug" element={<MovieDetailPage />} />
              <Route path="/booking/tickets/theater/:theaterId/showtime/:showtimeId/date/:date" element={<BookingPage />} />
              <Route path="/booking/combo/theater/:theaterId/showtime/:showtimeId/date/:date" element={<ComboPage />} />
              <Route path="/booking/payment/theater/:theaterId/showtime/:showtimeId/date/:date" element={<PaymentPage />} />
              <Route path="/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/theaters" element={<TheatersPage />} />
              <Route path="/gift" element={<GiftCardPage />} />
              <Route path="/gift-cards" element={<GiftCardPage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/my-account" element={<CustomerPage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/my-account" element={<CustomerPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BookingProvider>
    </Router>
  );
}

export default App;
