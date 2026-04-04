# BKinema - Cinema Booking System

A modern, full-stack cinema booking platform built with NestJS, React, and MySQL. This system provides comprehensive movie theater management, online booking, payment processing, and membership features.

Real deployment website: https://bkinema.percytony.com/

![Tech Stack](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Features

### Core Booking System
- **Real-time seat selection** with automatic timeout mechanism
- **Multiple auditorium types**: 2D, IMAX, ScreenX, 4DX
- **Dynamic pricing** based on seat type and showtime
- **Booking timeout management** - auto-cancel after 5 minutes
- **Combo deals** for food & beverages during booking

### Customer Management
- **JWT-based authentication** with role-based access control
- **User dashboard** with booking history and statistics
- **Membership tiers** with point accumulation system
- **Gift booking feature** - send movie tickets to friends

### Payment & Promotions
- **Payment integration** with transaction tracking
- **Coupon system** with multiple types:
  - Amount-based discounts
  - Percentage-based discounts
  - Gift cards
- **Point redemption system**
- **Refund management** with automated validation

### Advanced Features
- **Gift card purchase and redemption**
- **Booking gifts** between users
- **Sales reports** with detailed analytics
- **Automated showtime cleanup** for expired bookings
- **Health checks** and monitoring endpoints

### Admin Features
- **Dashboard analytics** with revenue tracking
- **Movie and showtime management**
- **Theater and auditorium configuration**
- **Coupon and promotion management**
- **User and booking oversight**

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MySQL 8.0+
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Task Scheduling**: @nestjs/schedule (cron jobs)
- **Security**: bcrypt for password hashing

### Frontend
- **Framework**: React 19
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API
- **State Management**: React Context API
- **UI Components**: Custom components with responsive design

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **SSL/TLS**: SSL certificate support
- **Deployment**: VPS-ready with deployment guides
- **Version Control**: Git

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │────────▶│  NestJS Backend │────────▶│  MySQL Database │
│   (Port 80)     │  REST   │   (Port 8000)   │  ORM    │   (Port 3306)   │
│                 │  API    │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                            │
        │                           │                            │
        ▼                           ▼                            ▼
   ┌─────────┐              ┌──────────────┐          ┌──────────────────┐
   │  Nginx  │              │  JWT Auth    │          │  Stored Procs    │
   │ (Proxy) │              │  Guards      │          │  Triggers        │
   └─────────┘              │  Swagger     │          │  Functions       │
                            │  Validation  │          │  Views           │
                            └──────────────┘          └──────────────────┘
```

### Modular Architecture

The backend follows NestJS modular architecture with 20+ feature modules:

- **Auth Module**: JWT authentication, login/register, password reset
- **User Module**: User management, profiles, role management
- **Movie Module**: Movie catalog, ratings, actors, genres
- **Theater Module**: Theater locations and configurations
- **Auditorium Module**: Auditorium types and capacity management
- **Seat Module**: Seat configurations and availability
- **Showtime Module**: Showtime scheduling and management
- **Booking Module**: Booking creation, timeout handling, history
- **Payment Module**: Payment processing and transaction logs
- **Ticket Module**: Ticket generation and validation
- **Coupon Module**: Coupon creation, validation, redemption
- **Gift Module**: Gift booking and gift card features
- **Membership Module**: Membership tiers and benefits
- **Point Module**: Point accumulation and redemption
- **Refund Module**: Refund requests and processing
- **Dashboard Module**: Analytics and reporting
- **FWB Menu Module**: Food & beverage combos
- **Transaction Module**: Transaction history and reconciliation

## Database Design

### Key Tables (20+ tables)

**Core Entities:**
- `User` - Customer and staff accounts
- `Customer`, `Staff` - Extended user profiles with roles
- `Movie` - Movie catalog with ratings
- `Theater` - Cinema locations
- `Auditorium` - Screening rooms with types (2D, IMAX, etc.)
- `Seat` - Individual seats with pricing
- `Showtime` - Movie screening schedules

**Booking Flow:**
- `Booking` - Booking records with status tracking
- `Ticket` - Generated tickets for confirmed bookings
- `Showtime_Seat` - Real-time seat availability
- `Payment` - Payment transactions
- `Transaction` - Financial records

**Promotions & Features:**
- `Coupon` - Discount coupons and gift cards
- `Applied_Coupon` - Coupon usage tracking
- `Membership` - Customer membership tiers
- `Point` - Point accumulation history
- `Gift` - Gift booking records
- `FWB` (Food, Water, Beverage) - Combo orders
- `Refund` - Refund requests

### Advanced Database Features

**Stored Procedures (20+):**
- `sp_apply_coupon` - Coupon validation and application
- `sp_delete_showtime` - Safe showtime deletion with constraints
- `sp_generate_sales_report` - Revenue analytics
- `sp_complete_booking` - Multi-step booking finalization
- `sp_refund_booking` - Automated refund processing
- And many more...

**Triggers:**
- Auto-update timestamps
- Point calculation on booking completion
- Coupon balance updates
- Seat availability synchronization

**Views:**
- Revenue summaries
- Booking analytics
- Customer statistics

**Functions:**
- Custom business logic calculations
- Date/time utilities
- Validation helpers

**Indexes:**
- Performance-optimized queries
- Foreign key indexes
- Composite indexes for complex searches

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8.0+
- **Docker** and Docker Compose (for containerized deployment)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bkinema.git
cd bkinema
```

#### 2. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE bkinema;

# Import schema and seed data
mysql -u root -p bkinema < backend/src/database/schema.sql
mysql -u root -p bkinema < backend/src/database/stored_procedures.sql
mysql -u root -p bkinema < backend/src/database/triggers.sql
mysql -u root -p bkinema < backend/src/database/functions.sql
mysql -u root -p bkinema < backend/src/database/views.sql
mysql -u root -p bkinema < backend/src/database/indexes.sql
```

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate JWT secret
node scripts/generate-jwt-secret.js

# Create .env file
cat > .env << EOF
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=bkinema

# JWT
JWT_SECRET=your_generated_secret
JWT_EXPIRES_IN=7d

# App
PORT=8000
NODE_ENV=development
EOF

# Run database migrations (if any)
npm run build

# Start development server
npm run start:dev
```

#### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000/api
EOF

# Start development server
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation (Swagger)**: http://localhost:8000/api

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Create .env file in root directory
cp .env.example .env
# Edit .env with your database credentials

# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:80
- **Backend**: http://localhost:8001

### Stop Containers

```bash
docker-compose down
```

## API Documentation

### Swagger/OpenAPI

Access interactive API documentation at `http://localhost:8000/api` when the backend is running.

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout

#### Movies
- `GET /api/movie` - List all movies
- `GET /api/movie/:id` - Get movie details
- `GET /api/movie/now-showing` - Currently showing movies
- `GET /api/movie/coming-soon` - Upcoming movies

#### Booking Flow
- `POST /api/booking/start` - Start booking & hold seats (5-min timeout)
- `POST /api/booking/fwb` - Update food & beverage items
- `POST /api/coupon/apply` - Apply coupon to booking
- `POST /api/payment` - Complete payment
- `GET /api/booking/my-bookings` - User booking history

#### Showtimes
- `GET /api/showtime` - List showtimes
- `GET /api/showtime/:id` - Showtime details
- `GET /api/showtime-seat/:showtimeId` - Available seats

#### Gift Features
- `POST /api/gift/booking` - Gift a booking to another user
- `GET /api/gift/received` - View received gifts
- `GET /api/gift/sent` - View sent gifts

#### Dashboard
- `GET /api/dashboard` - Customer dashboard (stats & activity)

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "DetailedErrorMessage"
}
```

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- booking.service.spec.ts
```

### Test Coverage

The project includes comprehensive E2E tests for critical features:

- **Booking timeout tests** - Verify 5-minute expiration
- **Coupon logic tests** - Complex coupon validation
- **Gift system tests** - Multi-user gift workflows
- **Payment flow tests** - End-to-end payment scenarios
- **Stored procedure tests** - Database logic validation
- **Sales report tests** - Analytics generation

### Frontend Testing

```bash
cd frontend

# Run component tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Project Structure

```
bkinema/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── main.ts            # Application entry point
│   │   ├── app.module.ts      # Root module
│   │   ├── common/            # Shared utilities
│   │   │   ├── decorators/    # Custom decorators (roles, user)
│   │   │   └── guards/        # Auth guards (JWT, roles)
│   │   ├── config/            # Configuration files
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   └── jwt.config.ts
│   │   ├── database/          # Database scripts
│   │   │   ├── schema.sql
│   │   │   ├── stored_procedures.sql
│   │   │   ├── triggers.sql
│   │   │   ├── functions.sql
│   │   │   ├── views.sql
│   │   │   └── indexes.sql
│   │   ├── health/            # Health check endpoint
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── coupon/
│   │   │   ├── dashboard/
│   │   │   ├── gift/
│   │   │   ├── membership/
│   │   │   ├── movie/
│   │   │   ├── payment/
│   │   │   ├── showtime/
│   │   │   ├── theater/
│   │   │   ├── ticket/
│   │   │   ├── user/
│   │   │   └── ... (20+ modules)
│   │   └── utils/             # Utility functions
│   │       ├── hash.util.ts
│   │       ├── response.util.ts
│   │       └── time.util.ts
│   ├── test/                  # E2E tests
│   │   ├── booking-timeout.e2e-spec.ts
│   │   ├── coupon.e2e-spec.ts
│   │   ├── gift.e2e-spec.ts
│   │   └── sales-report.e2e-spec.ts
│   ├── scripts/               # Utility scripts
│   │   ├── generate-jwt-secret.js
│   │   └── extract-db-objects.js
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # Entry point
│   │   ├── assets/           # Images, media files
│   │   │   └── media/
│   │   ├── components/       # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MembershipCard.jsx
│   │   │   ├── common/       # Shared components
│   │   │   └── home/         # Home page components
│   │   ├── config/           # Frontend config
│   │   │   └── index.js
│   │   ├── context/          # React Context
│   │   │   ├── BookingContext.jsx
│   │   │   ├── DeviceContext.jsx
│   │   │   └── PlatformContext.js
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── MoviesPage.jsx
│   │   │   ├── MovieDetailPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── CustomerPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── MembershipPage.jsx
│   │   │   ├── GiftCardPage.jsx
│   │   │   └── ... (15+ pages)
│   │   ├── services/         # API service layer
│   │   └── styles/           # CSS files
│   ├── Dockerfile
│   ├── nginx.conf            # Nginx configuration
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml        # Docker Compose config
├── deploy-h2cloud.md        # H2Cloud deployment guide
├── deploy-hostinger.md      # Hostinger deployment guide
├── nginx-vps.conf           # VPS Nginx config
└── README.md                # This file
```

## Deployment

### Production Deployment Options

Live production website: https://bkinema.percytony.com/

The project includes detailed deployment guides for multiple platforms:

#### 1. H2Cloud VPS Deployment
See [deploy-h2cloud.md](deploy-h2cloud.md) for step-by-step instructions:
- Docker-based deployment
- SSL certificate setup
- Nginx configuration
- Database migration

#### 2. Hostinger VPS Deployment
See [deploy-hostinger.md](deploy-hostinger.md) for Hostinger-specific setup.

#### 3. Manual VPS Deployment

```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y

# Clone and deploy
git clone https://github.com/yourusername/bkinema.git
cd bkinema
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose up -d
```

### Environment Variables (Production)

```env
# Database (Production)
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USERNAME=production_user
DB_PASSWORD=strong_password_here
DB_NAME=bkinema

# JWT (Generate new secret for production!)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# App
PORT=8000
NODE_ENV=production

# Optional: SSL/TLS
AIVEN_SSL_CA_PATH=/app/certs/ca.pem
```

### Health Check

The application includes health check endpoints:

```bash
# Check backend health
curl http://localhost:8000/health

# Expected response:
# { "status": "ok", "database": "connected" }
```

## Contributing

This is an academic project developed for the Database Systems course (HK251 - Database).

## License

This project is developed for educational purposes.

## Team

Developed by students from Ho Chi Minh City University of Technology (HCMUT) - Database Systems course.

## Acknowledgments

- **NestJS** - Progressive Node.js framework
- **React** - UI library
- **TypeORM** - Excellent ORM for TypeScript
- **MySQL** - Reliable database system
- **Docker** - Containerization platform

## Contact & Support

For questions or issues, please open an issue in the GitHub repository.

---

If you find this project helpful, please give it a star.

Built with NestJS, React, and MySQL
