# Pigeon - Fueling Station Management System
## Application Catalog

---

## Problem Statement

The fueling station industry faces significant operational challenges that hinder efficiency, profitability, and accountability:

### Current Challenges

**1. Manual Record-Keeping & Data Loss**
- Traditional paper-based systems for recording pump meter readings are prone to errors, manipulation, and loss
- Difficulty in tracking daily sales across multiple pumps and products
- Lack of historical data for trend analysis and forecasting

**2. Multi-Station Management Complexity**
- Organizations operating multiple fueling stations struggle with centralized oversight
- Inconsistent reporting standards across different locations
- Delayed visibility into station performance and sales metrics

**3. Accountability & Fraud Prevention**
- Limited traceability of who recorded sales and when
- Difficulty in detecting discrepancies between meter readings and revenue
- Lack of real-time monitoring capabilities for station managers and directors

**4. Communication Gaps**
- Inefficient communication channels between station managers, directors, and administrative staff
- Delayed issue resolution due to poor ticketing and support systems
- No centralized platform for operational queries and support

**5. Performance Analytics Deficiency**
- Inability to generate comprehensive reports on sales trends
- Lack of data-driven insights for strategic decision-making
- Manual aggregation of data for weekly, monthly, and yearly reports

**6. Resource Management Issues**
- Inefficient manager assignment and tracking across stations
- Poor visibility into pump/dispenser status and maintenance needs
- Difficulty in optimizing station operations based on performance data

---

## Introduction

**Pigeon** is a comprehensive, cloud-based fueling station management system designed to revolutionize how fuel retail organizations operate, monitor, and optimize their business operations. Built on modern web technologies, Pigeon provides a robust backend API that powers intelligent decision-making through real-time data collection, advanced analytics, and role-based access control.

### What is Pigeon?

Pigeon is an enterprise-grade management platform that digitizes and automates the entire lifecycle of fueling station operations—from pump-level sales recording to organization-wide performance analytics. The system serves as a central nervous system for fuel retail businesses, connecting stations, managers, directors, and administrative staff in a unified digital ecosystem.

### Who is it For?

**Fuel Retail Organizations** operating single or multiple fueling stations who need:
- Real-time visibility into sales and operations
- Centralized management and reporting
- Enhanced accountability and fraud prevention
- Data-driven decision-making capabilities

**Key User Roles:**
- **Administrators** - System configuration and user management
- **Directors** - Multi-station oversight and strategic planning
- **Station Managers** - Day-to-day operations and sales recording

### Technology Foundation

Built with **NestJS**, **TypeScript**, and **TypeORM**, Pigeon leverages enterprise-grade technologies to ensure:
- **Scalability** - Handle growing numbers of stations and transactions
- **Security** - JWT authentication and role-based access control
- **Reliability** - Robust error handling and data validation
- **Flexibility** - Support for SQLite (development) and MySQL (production)
- **Integration** - RESTful API with comprehensive Swagger documentation

---

## Features

### Authentication & Security
- **JWT-Based Authentication** - Secure, token-based user authentication
- **Role-Based Access Control (RBAC)** - Granular permissions for Admin, Director, and Manager roles
- **Password Management** - Secure password hashing with bcrypt and password change functionality
- **Session Management** - Configurable token expiration and refresh mechanisms

### 👥 User Management
- **Multi-Role User System** - Support for Admin, Director, and Manager roles with distinct permissions
- **User Profile Management** - Comprehensive user information including contact details and profile images
- **Manager Assignment** - Dynamic assignment and reassignment of managers to stations
- **User Statistics** - Real-time analytics on user distribution by role and status
- **User Status Control** - Activate or deactivate user accounts as needed

### Station Management
- **Complete Station Registry** - Maintain detailed records of all fueling stations
- **Geographic Tracking** - GPS coordinates (latitude/longitude) for location-based services
- **Address Management** - Comprehensive location data (address, ward, LGA, state)
- **Station Status Monitoring** - Track active/inactive status of stations
- **Manager Assignment** - Assign and unassign managers to specific stations
- **Price Configuration** - Set and update price per liter for each station
- **Station Statistics** - Overview of total, active, and inactive stations

### Sales Recording & Tracking
- **Pump-Level Sales Recording** - Record sales for individual pumps with precision
- **Meter Reading Tracking** - Capture opening and closing meter readings for accountability
- **Product Differentiation** - Separate tracking for Petrol and Diesel sales
- **Automatic Calculations** - System calculates volume sold and total revenue
- **Sales Attribution** - Track who recorded each sale and when
- **Real-Time Recording** - Instant sales data capture with timestamps

### Advanced Analytics & Reporting
- **Total Revenue Aggregation** - Organization-wide and station-specific revenue totals
- **Weekly Sales Trends** - Week-by-week sales performance analysis
- **Monthly Sales Trends** - Month-over-month revenue tracking
- **Daily Sales Reports** - Detailed daily sales breakdown per station
- **Comparative Analysis** - Compare performance across stations and time periods
- **Export Capabilities** - Generate reports for external analysis

### Dispenser/Pump Management
- **Pump Registration** - Register and track all fuel dispensers
- **Product Assignment** - Assign specific products (Petrol/Diesel) to pumps
- **Pump Numbering** - Unique identification for each pump
- **Station-Pump Relationships** - Link pumps to their respective stations
- **Pump Statistics** - Monitor total pumps and their distribution

### Support Ticket System
- **Ticket Creation** - Managers and directors can create support tickets
- **Reply System** - Multi-threaded conversations on tickets
- **Email-Based Filtering** - Find tickets by user email
- **Status Tracking** - Monitor ticket resolution status
- **Ticket Statistics** - Analytics on ticket volume and resolution
- **Role-Based Access** - Appropriate visibility based on user role

### Real-Time Communication
- **WebSocket Gateway** - Real-time chat and notifications
- **Instant Updates** - Live data synchronization across clients
- **Event Broadcasting** - Push notifications for critical events

### API & Integration
- **RESTful API** - Standard HTTP methods for all operations
- **Swagger Documentation** - Interactive API documentation at `/api`
- **CORS Support** - Configurable cross-origin resource sharing
- **Standardized Responses** - Consistent JSON response formats
- **Error Handling** - Comprehensive error messages and status codes

---

## Benefits

### For Fuel Retail Organizations

**1. Operational Efficiency**
- **Eliminate Manual Processes** - Reduce time spent on paperwork and manual calculations by up to 80%
- **Centralized Operations** - Manage all stations from a single dashboard
- **Streamlined Workflows** - Automated calculations and data aggregation save hours daily
- **Faster Decision-Making** - Real-time data enables quick operational adjustments

**2. Enhanced Accountability**
- **Complete Audit Trail** - Every transaction is logged with user attribution and timestamps
- **Fraud Prevention** - Meter reading tracking makes manipulation immediately visible
- **Performance Tracking** - Monitor individual manager and station performance
- **Transparent Operations** - Full visibility into who did what and when

**3. Data-Driven Insights**
- **Trend Analysis** - Identify patterns in sales across days, weeks, and months
- **Performance Benchmarking** - Compare stations to identify top performers and underperformers
- **Forecasting** - Use historical data to predict future sales and plan inventory
- **Strategic Planning** - Make informed decisions based on comprehensive analytics

**4. Cost Reduction**
- **Reduced Errors** - Automated calculations eliminate costly manual mistakes
- **Optimized Staffing** - Data-driven insights help optimize manager assignments
- **Inventory Management** - Better sales tracking leads to improved inventory planning
- **Reduced Theft** - Enhanced accountability deters fraudulent activities

**5. Scalability & Growth**
- **Easy Expansion** - Add new stations without increasing administrative burden
- **Consistent Standards** - Uniform processes across all locations
- **Cloud-Based** - No infrastructure investment required for scaling
- **Future-Ready** - Built on modern technologies that support growth

### For Directors

- **Multi-Station Oversight** - Monitor all stations from a single interface
- **Performance Dashboards** - Visual analytics for quick decision-making
- **Comparative Reports** - Identify best practices and areas for improvement
- **Strategic Control** - Access to organization-wide data for planning

### For Station Managers

- **Simplified Recording** - Quick and easy sales entry via mobile or desktop
- **Real-Time Feedback** - Instant confirmation of recorded sales
- **Support Access** - Direct ticketing system for issues and queries
- **Performance Visibility** - Track your station's performance metrics

### For Administrators

- **User Control** - Complete user lifecycle management
- **System Configuration** - Flexible setup to match organizational needs
- **Security Management** - Role-based access ensures data protection
- **Support Management** - Efficient ticket handling and resolution

---

## Aims and Objectives

### Primary Aim

**To digitally transform fueling station operations by providing a comprehensive, secure, and scalable management platform that enhances operational efficiency, accountability, and data-driven decision-making across single and multi-station fuel retail organizations.**

### Strategic Objectives

#### 1. Operational Excellence
- **Digitize Sales Recording** - Replace 100% of manual, paper-based sales recording with digital systems
- **Automate Calculations** - Eliminate manual calculation errors through automated volume and revenue computation
- **Centralize Data** - Create a single source of truth for all operational data
- **Standardize Processes** - Implement uniform procedures across all stations

#### 2. Enhanced Accountability & Transparency
- **Implement Audit Trails** - Ensure every transaction is traceable to a specific user and timestamp
- **Enable Meter Reading Verification** - Provide mechanisms to detect and prevent meter reading manipulation
- **Track User Actions** - Maintain comprehensive logs of all system activities
- **Ensure Data Integrity** - Implement validation and verification at every data entry point

#### 3. Data-Driven Decision Making
- **Provide Real-Time Analytics** - Deliver up-to-the-minute insights on sales and performance
- **Enable Trend Analysis** - Support weekly, monthly, and yearly performance comparisons
- **Support Forecasting** - Provide historical data for predictive analytics
- **Facilitate Benchmarking** - Enable performance comparison across stations

#### 4. Scalability & Growth Support
- **Support Multi-Station Operations** - Handle organizations with 1 to 100+ stations
- **Enable Easy Expansion** - Allow seamless addition of new stations and users
- **Ensure Performance** - Maintain system responsiveness as data volume grows
- **Future-Proof Architecture** - Build on technologies that support long-term evolution

#### 5. Security & Compliance
- **Protect Sensitive Data** - Implement industry-standard encryption and authentication
- **Control Access** - Enforce role-based permissions to prevent unauthorized access
- **Ensure Data Privacy** - Protect user and business information
- **Maintain Compliance** - Support regulatory and audit requirements

#### 6. User Empowerment
- **Simplify Operations** - Make daily tasks faster and easier for all users
- **Provide Training Support** - Offer comprehensive API documentation for developers
- **Enable Self-Service** - Allow managers to access their own performance data
- **Facilitate Communication** - Provide integrated ticketing and support systems

### Success Metrics

**Operational Metrics:**
- 100% digital sales recording across all stations
- 80% reduction in time spent on manual data entry
- 95% reduction in calculation errors
- Real-time data availability (< 1 second latency)

**Business Metrics:**
- Improved fraud detection and prevention
- Enhanced visibility into station performance
- Faster decision-making cycles
- Reduced operational costs

**Technical Metrics:**
- 99.9% system uptime
- Secure authentication for all users
- Comprehensive audit trails for all transactions
- Scalable architecture supporting growth

---

## Implementation Roadmap

### Phase 1: Foundation (Current)
- Core API development
- Authentication and authorization
- User management
- Station management
- Sales recording and tracking

### Phase 2: Analytics & Reporting
- Sales aggregation and trends
- Performance dashboards
- Report generation
- Advanced analytics features

### Phase 3: Enhancement
- Mobile application development
- Advanced visualization dashboards
- Predictive analytics
- Inventory management integration

### Phase 4: Optimization
- Performance optimization
- Advanced security features
- Third-party integrations
- AI-powered insights

---

## Target Market

### Primary Market
- **Multi-Station Fuel Retailers** - Organizations operating 5+ fueling stations
- **Growing Fuel Businesses** - Companies expanding their station network
- **Franchise Operations** - Fuel retail franchises needing centralized management

### Secondary Market
- **Independent Fuel Stations** - Single-station operators seeking professionalization
- **Fuel Distribution Companies** - Distributors managing retail outlets
- **Government Fuel Depots** - Public sector fuel management operations

### Geographic Focus
- Initially targeting Nigerian fuel retail market
- Expandable to West African markets
- Scalable to global fuel retail operations

---

## Contact & Support

For more information about Pigeon:
- **API Documentation**: Access at `/api` endpoint
- **Technical Support**: Create tickets through the system
- **Developer Resources**: Comprehensive README and API docs included

---

**Pigeon - Powering the Future of Fuel Retail Management**

*Built with modern technology. Designed for growth. Focused on results.*
