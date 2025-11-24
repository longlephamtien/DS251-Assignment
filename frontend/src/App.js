import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Theaters from './pages/Theaters';
import Membership from './pages/Membership';
import Gift from './pages/Gift';
import Booking from './pages/Booking';
import Auth from './pages/Auth';
import Account from './pages/Account';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/theaters" element={<Theaters />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/gift" element={<Gift />} />
          <Route path="/booking/:movieId" element={<Booking />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
