# Pigeon Backend

REST API for **Pigeon**, a management system for a network of Nigerian fuel stations. It tracks stations, the managers who run them, the pumps and storage tanks at each station, the selling price of each product, and the daily sales each manager records. From those records it reconciles what the pumps metered against what left the tanks, so directors can see expected versus actual sales per pump.

Built with [NestJS](https://nestjs.com) 11, TypeORM and SQLite. An Angular frontend lives in the sibling `frontend/` folder and talks to this API.

## Contents

- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Roles and seed accounts](#roles-and-seed-accounts)
- [Domain model](#domain-model)
- [API overview](#api-overview)
- [Project layout](#project-layout)
- [Development notes](#development-notes)
- [Testing](#testing)

## Quick start

Requires Node.js 22 or newer.

```bash
npm install
npm run start:dev
```

The API listens on `http://localhost:3000`. Interactive Swagger docs are at `http://localhost:3000/api/docs`, where you can log in and try every endpoint with the **Authorize** button.

On first start the app creates `pigeon.sqlite` in the working directory and seeds it with sample users, stations, pumps, reservoirs, prices and 90 days of daily sales. Delete the file to start over with a fresh seed.

Other scripts:

| Command | What it does |
|---|---|
| `npm run start` | Start once, without file watching |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm run lint` | ESLint with auto-fix (also applies Prettier) |
| `npm run format` | Prettier only |
| `npm test` | Unit tests |

## Configuration

Settings come from environment variables, read from a `.env` file in this folder if present.

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `JWT_SECRET` | dev fallback | **Required** when `NODE_ENV=production`; the app refuses to start without it |
| `JWT_EXPIRATION` | `1h` | Token lifetime, any `jsonwebtoken` duration string |
| `SEED_PASSWORD` | `password` | Password given to the seeded accounts |
| `NODE_ENV` | unset | Set to `production` to disable all seeding |

The database is a SQLite file named `pigeon.sqlite` in the working directory, with TypeORM `synchronize` on. That is convenient for development but means schema changes are applied automatically and destructively. Switch to migrations before pointing this at real data.

## Roles and seed accounts

There are three roles. Every request except login needs a `Bearer` JWT.

| Role | Can do |
|---|---|
| **admin** | Everything. Only role that can create other admins and directors or permanently remove equipment. |
| **director** | Create managers, create and edit stations, assign managers, set prices, add pumps and tanks, view every station's sales. |
| **manager** | Runs exactly one station. Records that station's daily sales and views its history. Cannot see other stations. |

Seeded logins (password is `SEED_PASSWORD`, default `password`):

| Username | Role | Station |
|---|---|---|
| `admin` | admin | — |
| `director` | director | — |
| `manager` | manager | Lekki Station |

## Domain model

```
Station ──< Pump            (each pump sells one product)
   │   ──< Reservoir        (one tank per product)
   │   ──< StationProductPrice (₦ per litre, per product)
   │
   └──< DailyRecord          (one per station per day, submitted by the manager)
           ├──< PumpReading       opening/closing meter, litres sold, price snapshot, ₦ amount
           └──< ReservoirReading  opening level, deliveries, closing level, expected litres
```

**Products** are petrol, diesel and kerosene. Prices are set per station and snapshotted onto each reading, so changing a price later never rewrites history.

**Daily record.** At close of day the manager submits one record containing the opening and closing totaliser of every in-service pump and the opening dip, any tanker delivery, and the closing dip of every reservoir. The API rejects, in one response listing every problem, a closing meter below its opening, a tank level above capacity or above opening plus deliveries, a missing pump or tank, a day in the future, and a second record for the same day. Pumps taken out of service are not required.

**Expected vs actual.** For each product:

- *actual litres* = sum over its pumps of (closing − opening meter)
- *expected litres* = opening level + deliveries − closing level of its tank
- *variance* = actual − expected, also expressed in ₦ at the day's price

Because one tank feeds every pump on a product, the per-pump expectation is the product's expected litres split equally across the pumps read that day. The product-level variance is the reliable number. The per-pump split is a guide for spotting a pump that is far from its peers. The calculation lives in `src/sales/sales-report.ts` and is covered by unit tests.

Pump and reservoir readings also store a copy of the pump name and product, so renaming, re-plumbing or deleting a pump leaves old records intact.

## API overview

All routes except `POST /auth/login` require `Authorization: Bearer <token>`. Full request and response shapes are in Swagger.

### Auth and users

| Method | Path | Who |
|---|---|---|
| `POST` | `/auth/login` | anyone |
| `GET` | `/users`, `/users/:id` | admin, director |
| `POST` | `/users` | admin (any role), director (managers only) |
| `GET` | `/managers`, `/managers/:id` | admin, director |
| `POST` | `/managers` | admin, director |
| `DELETE` | `/managers/:id` | admin, director. Soft delete: deactivates and unassigns |

### Stations and equipment

| Method | Path | Who |
|---|---|---|
| `GET` | `/stations`, `/stations/:id`, `/stations/stats`, `/stations/states` | all |
| `GET` | `/stations/mine` | all (the caller's own station, or empty) |
| `POST` | `/stations` | admin, director |
| `PATCH` | `/stations/:id` | admin, director. Includes assigning or unassigning the manager |
| `GET` | `/products` | all |
| `GET` | `/stations/:id/prices` | all |
| `PUT` | `/stations/:id/prices/:product` | admin, director |
| `GET` | `/stations/:id/pumps`, `/pumps/:id` | all |
| `POST` | `/stations/:id/pumps` | admin, director |
| `PATCH` | `/pumps/:id` | admin, director. Rename, change product, take in or out of service |
| `DELETE` | `/pumps/:id` | admin only. Permanent; past readings are kept |
| `GET` | `/stations/:id/reservoirs`, `/reservoirs/:id` | all |
| `POST` | `/stations/:id/reservoirs` | admin, director |
| `PATCH` | `/reservoirs/:id` | admin, director |

### Sales

Managers are always scoped to their own station and may omit `stationId`. Directors and admins pass `stationId`, or omit it on the list and summary routes to see every station.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/sales/daily/template` | Pre-filled form for today: every in-service pump and tank, with opening values carried over from the last record |
| `POST` | `/sales/daily` | Submit a day's readings. Returns the expected vs actual report |
| `PUT` | `/sales/daily/:id` | Replace a day's readings |
| `GET` | `/sales/daily?from&to&stationId` | Records in a range, each with its report |
| `GET` | `/sales/daily/:id` | One record with its report |
| `GET` | `/sales/summary?from&to&stationId` | Daily ₦ and litre totals for charts. Defaults to the last 30 days |

### Tickets

Simple internal support tickets with status (`open`, `in_progress`, `resolved`, `closed`) and priority (`low` to `urgent`).

| Method | Path | Who |
|---|---|---|
| `GET` | `/tickets`, `/tickets/:id`, `/tickets/stats` | all |
| `POST` | `/tickets` | all |
| `PATCH` | `/tickets/:id` | admin, director |

## Project layout

```
src/
├── auth/          login, JWT guard, roles guard and @Roles() decorator
├── users/         user entity, role and status enums, user creation rules
├── managers/      manager-specific views (user + the station they run)
├── stations/      stations, status, manager assignment, Nigerian states list
├── products/      product enum and per-station prices
├── pumps/         pumps
├── reservoirs/    storage tanks
├── sales/         daily records, readings, report builder, summary
├── tickets/       support tickets
├── common/        date helpers, seeded PRNG, Nigerian states
└── config/        JWT config
```

Each feature folder follows the same shape: `entities/`, `dto/`, a `*.service.ts`, a `*.controller.ts` and a `*.module.ts`. Services that seed data implement `OnModuleInit`; Nest initialises imported modules first, so seeding order follows the module import graph (users, then stations, then equipment and prices, then sales).

## Development notes

- **Validation.** A global `ValidationPipe` runs with `whitelist` and `transform`, so unknown body fields are dropped and query strings are coerced to their DTO types. Every DTO is annotated for Swagger.
- **No ORM relations.** Entities store plain ids plus the denormalised fields a list view needs (for example a station's `managerUsername`). This keeps reads to a single table and keeps password hashes out of any response.
- **Money and volume** are `real` columns. Amounts are rounded to two decimals at write time; litres are stored as submitted.
- **Dates** are `YYYY-MM-DD` strings in the server's local time zone, which keeps grouping by day trivial in SQLite.
- **Role checks** live in controllers through `@Roles()`. Station scoping for managers is enforced in `SalesService`, not in the guard, because it depends on data.
- **Frontend contract.** The Angular dashboard consumes `GET /sales/summary` and relies on its current field names. Change that response and the frontend together.

## Testing

```bash
npm test            # unit tests (jest)
npm run test:watch
npm run test:cov
npm run test:e2e
```

The report builder has focused unit tests in `src/sales/sales-report.spec.ts`. The users service spec predates the TypeORM repository injection and currently fails to build its testing module; it needs a repository mock before it will pass.
