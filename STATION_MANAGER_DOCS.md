# Station Manager Documentation

This guide outlines the features available to Station Managers in the Pigeon Fuel Station Management System.
Base URL: `http://localhost:3000`

## 1. Getting Started: "My Station"

Managers are assigned to a specific station. To interact with your station, you first need to identify it.

### **Get My Station**
- **Endpoint**: `GET /station/mine`
- **Description**: Returns the details of the station assigned to the logged-in manager.
- **Use Case**: Call this on login/dashboard load to get the `stationId` (UUID) needed for other operations.
- **Response**:
  ```json
  {
    "id": "a1b2c3d4-...",
    "name": "Eagle Fuel Depot",
    "petrolVolume": 5000,
    "dieselVolume": 3000,
    ...
  }
  ```

### **Get Station Summary**
- **Endpoint**: `GET /station/:id/summary`
- **Description**: Returns calculated stats like current fuel levels, number of functional pumps, and recent sales.

---

## 2. Daily Operations

### **Record Daily Sales**
Managers must record the closing figures for each pump daily.

- **Endpoint**: `POST /station/record`
- **Body**:
  ```json
  {
    "pumpId": "uuid-of-pump",
    "recordDate": "2024-11-20",
    "volumeSold": 500.5,
    "totalRevenue": 350000
  }
  ```

### **Record Individual Transaction**
If real-time sales are tracked (optional workflow):
- **Endpoint**: `POST /sales`
- **Body**:
  ```json
  {
    "pumpId": "uuid-of-pump",
    "product": "PETROL",
    "pricePerLitre": 700,
    "openingMeterReading": 1000,
    "closingMeterReading": 1050
  }
  ```

---

## 3. Inventory Management

### **Request Fuel Restock**
When fuel is low, request a supply refill.

- **Endpoint**: `POST /supply/request`
- **Body**:
  ```json
  {
    "stationId": "uuid-from-my-station",
    "product": "DIESEL",
    "quantity": 10000
  }
  ```

### **Update Station Details**
Managers can update specific details of their station (e.g., prices or status).

- **Endpoint**: `PATCH /station/:id`
- **Restriction**: You can strictly ONLY update the station assigned to you.
- **Body** (Example: Change Price):
  ```json
  {
    "petrolPricePerLiter": 710.00
  }
  ```

---

## 4. Reporting

- **Sales History**: `GET /sales` (returns list of sales recorded by you/your station).
- **Daily Report**: `GET /sales/report/daily/station/:id` (Daily aggregated view).
