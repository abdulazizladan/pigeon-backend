# Pigeon Backend API Documentation

This document lists the available API endpoints for the Pigeon Fuel Station Management System.
Base URL: `http://localhost:3000` (or your deployed URL)

## Authentication (`/auth`)

| Method | Endpoint | Description | Roles | Body/Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Login user | Public | `{ email, password }` |
| `PATCH` | `/auth/change-password` | Change authenticated user's password | Admin, Director, Manager | `{ oldPassword, newPassword }` |

## Station Management (`/station`)

| Method | Endpoint | Description | Roles | Body/Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/station` | Create new station with pumps | Admin, Director | `{ name, address, ..., managerId, pumps: [] }` |
| `GET` | `/station` | Get all stations | Director | - |
| `GET` | `/station/stats` | Get global station stats (total, active, inactive) | Director, Admin | - |
| `GET` | `/station/:id` | Get single station details | Director, Manager | - |
| `PATCH` | `/station/:id` | Update station details | Director | `{ pricePerLiter, status, ... }` |
| `DELETE` | `/station/:id` | Delete station | Director | - |
| `GET` | `/station/:id/summary` | Get station summary (fuel levels, pump status, sales) | Director, Manager | - |
| `POST` | `/station/:id/manager/assign` | Assign manager to station | Director | `{ managerId }` |
| `DELETE` | `/station/:id/manager/unassign` | Unassign manager | Director | - |
| `POST` | `/station/record` | Record daily pump sales (upsert) | Manager | `{ pumpId, recordDate, volumeSold, totalRevenue }` |
| `GET` | `/station/report/daily` | Get daily sales report grouped by station | Director | - |

## Sales Management (`/sales`)

| Method | Endpoint | Description | Roles | Body/Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/sales` | Record new sale transaction | Manager | `{ product, pricePerLitre, openingMeterReading, closingMeterReading, pumpId }` |
| `GET` | `/sales` | Get all sales records | Director, Manager | `?page=1&limit=20` |
| `GET` | `/sales/:id` | Get single sale record | Director, Manager | - |
| `PATCH` | `/sales/:id` | Update sale record | Manager | `{ closingMeterReading, ... }` |
| `DELETE` | `/sales/:id` | Delete sale record | Manager | - |
| `GET` | `/sales/report/total` | Get total revenue (global) | Director, Manager | - |
| `GET` | `/sales/report/station/:stationId/total` | Get total revenue for a station | Director, Manager | - |
| `GET` | `/sales/report/weekly` | Get sales grouped by week | Director, Manager | - |
| `GET` | `/sales/report/monthly` | Get sales grouped by month | Director, Manager | - |
| `GET` | `/sales/report/daily/station/:stationId` | Get daily sales aggregation for a station | Director, Manager | - |
| `GET` | `/sales/report/daily/history` | **(Chart)** Get 30-day sales history (Collective) | Director, Manager | Returns `[{ date, totalSales }]` |
| `GET` | `/sales/report/daily/station/:stationId/history` | **(Chart)** Get 30-day sales history for a station | Director, Manager | Returns `[{ date, totalSales }]` |

## Supply & Restock (`/supply`)

| Method | Endpoint | Description | Roles | Body/Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/supply/request` | Request fuel restock | Manager | `{ stationId, product, quantity }` |
| `GET` | `/supply` | List all requests | Director | - |
| `GET` | `/supply/station/:stationId` | List requests by station | Director, Manager | - |
| `PATCH` | `/supply/:id/status` | Approve/Reject/Deliver request | Director | `{ status: 'APPROVED' | 'DELIVERED' | 'REJECTED' }` |
| `GET` | `/supply/stats/trends` | **(Chart)** Get global restock trends (last 30 days) | Director | Returns `[{ date, product, totalQuantity }]` |
| `GET` | `/supply/station/:stationId/stats/trends` | **(Chart)** Get station restock trends (last 30 days) | Director, Manager | Returns `[{ date, product, totalQuantity }]` |

### **Notes**
*   **Authentication**: Most endpoints require a Bearer Token. (`Authorization: Bearer <token>`)
*   **Roles**: `Director` usually has global access. `Manager` is scoped to operational tasks (Sales, Requests).
*   **Charts**: Endpoints marked with **(Chart)** are specifically formatted for line/bar graphs.
