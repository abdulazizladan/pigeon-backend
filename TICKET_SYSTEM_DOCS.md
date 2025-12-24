# Ticket System API Documentation

This document documents the Ticket System API for the Pigeon Fuel Station Management System.
Base URL: `http://localhost:3000/ticket`

## Overview

The ticket system allows users to report issues and receive support.
- **Admins** can view all tickets and statistics.
- **Directors/Managers** can create tickets and view tickets they created (by email).
- **All Roles** (implied) can reply to active tickets.

**Validation Rule**: Replies cannot be added to tickets with a status of `resolved`.

## Endpoints

### 1. Stats (`/stats`)
- **Method**: `GET`
- **Role**: `Admin`
- **Description**: Returns counts of tickets by status (total, active, resolved, dismissed).
- **Response**:
  ```json
  {
    "total": 50,
    "active": 12,
    "resolved": 35,
    "dismissed": 3
  }
  ```

### 2. List All Tickets (`/`)
- **Method**: `GET`
- **Role**: `Admin`
- **Description**: Retrieves a list of all tickets in the system.

### 3. Create Ticket (`/`)
- **Method**: `POST`
- **Role**: `Director`, `Manager`
- **Description**: Creates a new support ticket.
- **Body**:
  ```json
  {
    "subject": "Pump 2 Malfunction",
    "message": "The pump stopped dispensing after a power surge.",
    "priority": "high", // optional
    "category": "maintenance" // optional
  }
  ```

### 4. Get By ID (`/:id`)
- **Method**: `GET`
- **Role**: `Admin`, `Director`, `Manager`
- **Description**: Details of a specific ticket, including its message history (`replies`).

### 5. Get By Email (`/email/:email`)
- **Method**: `GET`
- **Role**: `Director`, `Manager`
- **Description**: Retrieves all tickets created by a specific user email. useful for "My Tickets" view.

### 6. Reply to Ticket (`/:id/reply`)
- **Method**: `POST`
- **Role**: `Admin`, `Director`, `Manager`
- **Description**: Adds a reply/comment to a ticket.
- **Restriction**: **Cannot reply if status is `resolved`.**
- **Body**:
  ```json
  {
    "message": "A technician has been dispatched."
  }
  ```

### 7. Update Status/Details (`/:id`)
- **Method**: `PATCH`
- **Role**: `Admin`
- **Description**: Updates ticket status (e.g., mark as `resolved`) or other fields.
- **Body**:
  ```json
  {
    "status": "resolved"
  }
  ```
