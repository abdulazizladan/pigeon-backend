/**
 * Demo data (stations, equipment, prices, sales history, tickets) is only seeded when explicitly
 * asked for with SEED_DEMO_DATA=true, and never in production. The default accounts in
 * UsersService are seeded regardless so there is always a way to log in.
 */
export function shouldSeedDemoData(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.SEED_DEMO_DATA === 'true';
}
