# Pigeon Backend API Endpoints

## Authentication (`/auth`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Login to the system | Public |
| `POST` | `/auth/reset-password` | Reset user password (Not implemented) | Public |
| `PATCH` | `/auth/change-password` | Change authenticated user's password | Admin, Director, Manager |

## Users (`/user`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/user` | Create a new user | Admin |
| `GET` | `/user/stats` | Get user statistics by role and status | Admin, Director |
| `GET` | `/user` | Get all users | Admin, Director |
| `GET` | `/user/managers` | Get all managers | Public |
| `GET` | `/user/manager/:id` | Get manager by ID | Public |
| `GET` | `/user/:email` | Find one user by email | Admin (via Guard) |
| `PATCH` | `/user/:email` | Update user details | Admin |
| `DELETE` | `/user/:email` | Remove user | Admin |

## Stations (`/station`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/station/mine` | Get the station assigned to the logged-in manager | Manager |
| `GET` | `/station/stats` | Get station statistics | Director, Admin |
| `POST` | `/station` | Create a new station | Admin, Director |
| `GET` | `/station` | Get all stations | Director |
| `GET` | `/station/:id` | Get single station by ID | Director, Manager |
| `GET` | `/station/:id/summary` | Get specific station summary stats | Director, Manager, Admin |
| `GET` | `/station/:id/sales-graph` | Get 30-day sales graph for a station | Director, Manager |
| `PATCH` | `/station/:id` | Update station details | Director, Manager (Own Station) |
| `PATCH` | `/station/:id/status` | Update station status (active/suspended) | Director, Manager (Own Station) |
| `DELETE` | `/station/:id` | Delete station | Director |
| `POST` | `/station/:id/manager/assign` | Assign a manager to a station | Director |
| `DELETE` | `/station/:id/manager/unassign` | Unassign manager from station | Director |
| `POST` | `/station/record` | Record/Update daily pump sales | Manager |
| `GET` | `/station/report/daily` | Get aggregated daily sales report | Director |

## Supply & Restock (`/supply`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/supply/request` | Request fuel restock | Manager |
| `GET` | `/supply` | List all supply requests | Director |
| `GET` | `/supply/station/:stationId` | List supply requests by station | Director, Manager |
| `PATCH` | `/supply/:id/status` | Approve/Reject/Deliver supply request | Director |
| `GET` | `/supply/stats/trends` | Get global refuel trends (last 30 days) | Director |
| `GET` | `/supply/station/:stationId/stats/trends` | Get station refuel trends | Director, Manager |
| `GET` | `/supply/last-restock/:stationId` | Get last restock details (Petrol & Diesel) | Director, Manager |

## Sales Management (`/sales`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/sales` | Create a new sale | Manager |
| `GET` | `/sales` | Get all sales | Director, Manager |
| `GET` | `/sales/:id` | Get a sale by ID | Director, Manager |
| `PATCH` | `/sales/:id` | Update a sale | Manager |
| `DELETE` | `/sales/:id` | Delete a sale | Manager |
| `GET` | `/sales/report/total` | Get total global sales revenue | Director, Manager |
| `GET` | `/sales/report/station/:stationId/total` | Get total sales revenue by station | Director, Manager |
| `GET` | `/sales/report/weekly` | Get total sales grouped by week | Director, Manager |
| `GET` | `/sales/report/monthly` | Get total sales grouped by month | Director, Manager |
| `GET` | `/sales/report/daily/station/:stationId` | Get daily sales records per station | Director, Manager |
| `GET` | `/sales/report/daily/history` | Get global 30-day sales history | Director, Manager |
| `GET` | `/sales/report/daily/station/:stationId/history` | Get station 30-day sales history | Director, Manager |
| `GET` | `/sales/report/daily/cumulative` | Get global 30-day **cumulative** sales trend | Director, Manager |
| `GET` | `/sales/report/daily/station/:stationId/cumulative`| Get station 30-day **cumulative** sales trend | Director, Manager |
| `GET` | `/sales/station/:id` | Get all sales by station ID | Public |

## Dispensers (`/dispenser`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/dispenser/stats` | Get dispenser statistics | Admin, Director |
| `POST` | `/dispenser` | Create a new dispenser | Manager |
| `GET` | `/dispenser` | Get all dispensers | Director, Manager |
| `GET` | `/dispenser/:id` | Get dispenser by ID | Director, Manager |
| `PATCH` | `/dispenser/:id` | Update dispenser | Manager |
| `DELETE` | `/dispenser/:id` | Delete dispenser | Manager |

## Tickets (`/ticket`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/ticket` | Create a new ticket | Director, Manager |
| `GET` | `/ticket/stats` | Get ticket statistics | Admin |
| `POST` | `/ticket/:ticketID/reply` | Add reply to a ticket | Admin, Director, Manager |
| `GET` | `/ticket` | Get all tickets | Admin |
| `GET` | `/ticket/email/:email` | Get tickets by email | Director, Manager |
| `GET` | `/ticket/:id` | Get ticket by ID | Admin, Director, Manager |
| `PATCH` | `/ticket/:id` | Update ticket | Admin |
| `DELETE` | `/ticket/:id` | Remove ticket | Admin |

## Reports (`/report`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/report` | Create a new report | Manager |
| `GET` | `/report` | Get all reports | Admin, Director |
| `GET` | `/report/:id` | Get a report by ID | Director, Manager |
| `PATCH` | `/report/:id` | Update a report | Manager |
| `DELETE` | `/report/:id` | Delete a report | Manager |

## Analytics (`/analytics`)
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/sales/monthly-comparison` | Get Monthly Sales Comparison | Public |
| `GET` | `/analytics/sales/trend/30-days` | Get 30-Day Sales Trend | Public |
| `GET` | `/analytics/sales/product-comparison` | Get Product Comparison | Public |
| `GET` | `/analytics/stations/performance/yesterday` | Get Top/Bottom Stations Performance | Public |
