# Pigeon - Fueling Station Management API

A comprehensive NestJS-based backend API for managing fueling stations, sales tracking, user management, and support ticketing systems.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Testing](#testing)
- [License](#license)

## 🎯 Overview

Pigeon is a robust backend system designed to manage fueling station operations across multiple locations. It provides comprehensive APIs for:

- **Multi-station management** with geographic tracking
- **Real-time sales recording** per pump with meter readings
- **Role-based access control** (Admin, Director, Manager)
- **Performance analytics** with aggregated reporting
- **Support ticket system** with real-time chat capabilities
- **Pump/dispenser management** across stations

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password management with bcrypt
- Password change functionality

### 👥 User Management
- Multi-role user system (Admin, Director, Manager)
- User profile management with contact information
- User statistics and analytics
- Manager assignment to stations

### ⛽ Station Management
- Complete CRUD operations for fueling stations
- Geographic location tracking (latitude/longitude)
- Station status monitoring (active/inactive)
- Manager assignment and unassignment
- Station-specific statistics
- Daily sales reporting per station

### 💰 Sales Tracking
- Per-pump sales recording with meter readings
- Opening and closing meter reading tracking
- Product-specific sales (Petrol, Diesel)
- Automated price calculations
- Sales aggregation by:
  - Total revenue
  - Weekly trends
  - Monthly trends
  - Station-specific totals
  - Daily sales per station

### 🔧 Dispenser/Pump Management
- Pump registration and tracking
- Product assignment per pump
- Pump statistics
- Station-pump relationships

### 🎫 Support Ticket System
- Ticket creation and management
- Reply/comment system
- Ticket status tracking
- Email-based ticket filtering
- Ticket statistics

### 📊 Reporting & Analytics
- Aggregated daily sales reports
- Weekly and monthly sales trends
- Station performance metrics
- User and ticket statistics
- Real-time data visualization support

### 💬 Real-time Communication
- WebSocket-based chat gateway
- Real-time notifications

## 🛠 Technology Stack

- **Framework**: NestJS 10.x
- **Runtime**: Node.js
- **Language**: TypeScript 5.x
- **Database**: 
  - SQLite (development)
  - MySQL support (production-ready)
- **ORM**: TypeORM 0.3.x
- **Authentication**: Passport.js with JWT strategy
- **API Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.io
- **Validation**: class-validator & class-transformer

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- SQLite (for development) or MySQL (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**
   ```bash
   # Development mode with hot-reload
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

5. **Access the API**
   - API Base URL: `http://localhost:3000`
   - Swagger Documentation: `http://localhost:3000/api`

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI. Once the application is running, visit:

```
http://localhost:3000/api
```

### Main API Endpoints

#### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/reset-password` - Password reset
- `PATCH /auth/change-password` - Change password (authenticated)

#### Users (`/user`)
- `GET /user` - Get all users
- `GET /user/stats` - Get user statistics
- `GET /user/managers` - Get all managers
- `GET /user/manager/:id` - Get manager by ID
- `GET /user/:email` - Get user by email
- `POST /user` - Create new user
- `PATCH /user/:email` - Update user
- `DELETE /user/:email` - Delete user

#### Stations (`/station`)
- `GET /station` - Get all stations
- `GET /station/stats` - Get station statistics
- `GET /station/:id` - Get station by ID
- `POST /station` - Create new station
- `PATCH /station/:id` - Update station
- `DELETE /station/:id` - Delete station
- `POST /station/:id/assign-manager` - Assign manager to station
- `POST /station/:id/unassign-manager` - Unassign manager from station
- `POST /station/record-sales` - Record daily sales
- `GET /station/report/daily` - Get aggregated daily sales report

#### Sales (`/sales`)
- `GET /sales` - Get all sales
- `GET /sales/:id` - Get sale by ID
- `GET /sales/station/:id` - Get sales by station
- `POST /sales` - Create new sale
- `PATCH /sales/:id` - Update sale
- `DELETE /sales/:id` - Delete sale
- `GET /sales/report/total` - Get total sales revenue
- `GET /sales/report/station/:stationId/total` - Get total sales by station
- `GET /sales/report/weekly` - Get weekly sales trends
- `GET /sales/report/monthly` - Get monthly sales trends
- `GET /sales/report/daily/station/:stationId` - Get daily sales by station

#### Dispensers/Pumps (`/dispenser`)
- `GET /dispenser` - Get all dispensers
- `GET /dispenser/stats` - Get dispenser statistics
- `GET /dispenser/:id` - Get dispenser by ID
- `POST /dispenser` - Create new dispenser
- `PATCH /dispenser/:id` - Update dispenser
- `DELETE /dispenser/:id` - Delete dispenser

#### Tickets (`/ticket`)
- `GET /ticket` - Get all tickets
- `GET /ticket/stats` - Get ticket statistics
- `GET /ticket/:id` - Get ticket by ID
- `GET /ticket/email/:email` - Get tickets by email
- `POST /ticket` - Create new ticket
- `POST /ticket/:ticketID/reply` - Add reply to ticket
- `PATCH /ticket/:id` - Update ticket
- `DELETE /ticket/:id` - Delete ticket

#### Reports (`/report`)
- `GET /report` - Get all reports
- Additional reporting endpoints as needed

### Role-Based Access

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, ticket management |
| **Director** | Station management, sales viewing, reporting, ticket creation |
| **Manager** | Station-specific operations, sales recording, ticket creation |

## 🏗 Architecture

### Module Structure

```
src/
├── auth/              # Authentication & authorization
│   ├── guards/        # JWT & role guards
│   ├── strategies/    # Passport strategies
│   └── decorators/    # Custom decorators
├── user/              # User management
│   ├── entities/      # User & Info entities
│   ├── dto/           # Data transfer objects
│   └── enums/         # Role & status enums
├── station/           # Station management
│   ├── entities/      # Station entity
│   └── dto/           # Station DTOs
├── sale/              # Sales tracking
│   ├── entities/      # Sale entity
│   ├── dto/           # Sale DTOs
│   └── enums/         # Product enums
├── dispenser/         # Pump/dispenser management
│   ├── entities/      # Dispenser entity
│   └── dto/           # Dispenser DTOs
├── ticket/            # Support ticket system
│   ├── entities/      # Ticket & Reply entities
│   └── dto/           # Ticket DTOs
├── report/            # Reporting module
└── chat.gateway.ts    # WebSocket gateway
```

### Database Schema

The application uses TypeORM with the following main entities:

- **User** - User accounts with authentication
- **Info** - User profile information
- **Contact** - User contact details
- **Station** - Fueling station details
- **Dispenser/Pump** - Fuel dispensers
- **Sale** - Sales transactions
- **Ticket** - Support tickets
- **Reply** - Ticket replies

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Database Configuration (SQLite - Development)
DATABASE_URL="sqlite://db"

# Database Configuration (MySQL - Production)
# Uncomment and configure for production use
# DB_TYPE=mysql
# DB_HOST=your-mysql-host
# DB_PORT=3306
# DB_USERNAME=your-username
# DB_PASSWORD=your-password
# DB_DATABASE=your-database

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h

# CORS Configuration
CORS_ORIGIN=*
```

### Database Configuration

The application supports both SQLite (development) and MySQL (production):

**SQLite (Default)**
```typescript
type: 'sqlite',
database: 'db',
synchronize: true
```

**MySQL (Production)**
```typescript
type: 'mysql',
host: 'your-host',
port: 3306,
username: 'your-username',
password: 'your-password',
database: 'your-database',
synchronize: false // Set to false in production!
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run start          # Start application
npm run start:dev      # Start with hot-reload
npm run start:debug    # Start in debug mode

# Building
npm run build          # Build for production

# Code Quality
npm run format         # Format code with Prettier
npm run lint           # Lint and fix code

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
```

### Development Workflow

1. **Create a new module**
   ```bash
   nest generate module module-name
   nest generate controller module-name
   nest generate service module-name
   ```

2. **Add authentication to routes**
   ```typescript
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Roles(Role.admin, Role.director)
   @Get()
   findAll() {
     // Your code here
   }
   ```

3. **Document with Swagger**
   ```typescript
   @ApiOperation({ summary: 'Description' })
   @ApiOkResponse({ description: 'Success response' })
   @ApiBearerAuth()
   ```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Data Models

### Key Entities

#### Station
```typescript
{
  id: string;              // UUID
  name: string;
  address: string;
  ward: string;
  lga: string;
  state: string;
  longitude: number;
  latitude: number;
  pricePerLiter: number;
  status: "active" | "inactive";
  manager?: User;
  sales?: Sale[];
  pumps?: Pump[];
  createdAt: Date;
  lastUpdated: Date;
}
```

#### Sale
```typescript
{
  id: string;              // UUID
  product: "PETROL" | "DIESEL";
  pricePerLitre: number;
  openingMeterReading: number;
  closingMeterReading: number;
  totalPrice: number;
  createdAt: Date;
  recordedBy?: User;
  station?: Station;
  pump?: Pump;
}
```

#### User
```typescript
{
  id: string;              // UUID
  email: string;
  role: "admin" | "director" | "manager";
  status: "active" | "inactive";
  info?: {
    firstName: string;
    lastName: string;
    image?: string;
  };
  contact?: {
    phone: string;
  };
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Role-Based Access Control** - Fine-grained permissions
- **CORS Protection** - Configurable CORS settings
- **Input Validation** - class-validator for DTO validation
- **SQL Injection Protection** - TypeORM parameterized queries

## 📈 Performance & Analytics

The API provides comprehensive analytics endpoints for:

- **Sales Trends** - Weekly and monthly aggregations
- **Station Performance** - Per-station metrics
- **User Activity** - User and role statistics
- **Ticket Metrics** - Support ticket analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED license.

## 📞 Support

For support and questions:
- Create a ticket through the `/ticket` endpoint
- Check the API documentation at `/api`
- Review the code documentation

---

**Built with ❤️ using NestJS**
