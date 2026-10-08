import { Product } from '../products/product.enum';
import { DailyRecord } from './entities/daily-record.entity';
import { PumpReading } from './entities/pump-reading.entity';
import { ReservoirReading } from './entities/reservoir-reading.entity';

export const round2 = (n: number) => Math.round(n * 100) / 100;

export interface PumpLine {
  pumpId: string;
  pumpName: string;
  product: Product;
  openingReading: number;
  closingReading: number;
  pricePerLitre: number;
  /** Metered: closing − opening. */
  actualLitres: number;
  actualAmount: number;
  /** This pump's equal share of the reservoir drop; null when the reservoir was not read. */
  expectedLitres: number | null;
  expectedAmount: number | null;
  /** actual − expected. Positive means the meters sold more than the tank gave up. */
  varianceLitres: number | null;
  varianceAmount: number | null;
}

export interface ReservoirLine {
  reservoirId: string;
  openingLevel: number;
  deliveredLitres: number;
  closingLevel: number;
  expectedLitres: number;
}

export interface Totals {
  expectedLitres: number;
  actualLitres: number;
  varianceLitres: number;
  expectedAmount: number;
  actualAmount: number;
  varianceAmount: number;
}

export interface ProductLine extends Totals {
  product: Product;
  pricePerLitre: number | null;
  reservoir: ReservoirLine | null;
  pumps: PumpLine[];
}

export interface DailySalesReport {
  id: string;
  stationId: string;
  recordedOn: string;
  notes: string | null;
  recordedById: string | null;
  recordedByUsername: string | null;
  createdAt: Date;
  updatedAt: Date;
  products: ProductLine[];
  totals: Totals;
}

/**
 * Reconciles a day's pump meters (actual) against its reservoir dips (expected).
 *
 * Expected litres for a product = opening level + deliveries − closing level. A single tank feeds
 * every pump on that product, so the expectation is shared equally between the pumps that were
 * read that day; the product-level variance is the figure to trust, the per-pump split is a guide.
 */
export function buildDailyReport(
  record: DailyRecord,
  pumpReadings: PumpReading[],
  reservoirReadings: ReservoirReading[],
): DailySalesReport {
  const products = new Set<Product>();
  for (const r of pumpReadings) products.add(r.product);
  for (const r of reservoirReadings) products.add(r.product);

  const lines: ProductLine[] = [];
  for (const product of [...products].sort()) {
    const pumps = pumpReadings.filter((r) => r.product === product);
    const tank = reservoirReadings.find((r) => r.product === product) ?? null;
    const price = pumps[0]?.pricePerLitre ?? null;

    const actualLitres = round2(pumps.reduce((sum, p) => sum + p.litresSold, 0));
    const actualAmount = round2(pumps.reduce((sum, p) => sum + p.amount, 0));
    const expectedLitres = tank ? round2(tank.expectedLitres) : 0;
    const expectedAmount = tank && price !== null ? round2(expectedLitres * price) : 0;
    const sharePerPump = tank && pumps.length ? expectedLitres / pumps.length : null;

    lines.push({
      product,
      pricePerLitre: price,
      reservoir: tank
        ? {
            reservoirId: tank.reservoirId,
            openingLevel: tank.openingLevel,
            deliveredLitres: tank.deliveredLitres,
            closingLevel: tank.closingLevel,
            expectedLitres,
          }
        : null,
      expectedLitres,
      actualLitres,
      varianceLitres: round2(actualLitres - expectedLitres),
      expectedAmount,
      actualAmount,
      varianceAmount: round2(actualAmount - expectedAmount),
      pumps: pumps.map((p) => {
        const expected = sharePerPump === null ? null : round2(sharePerPump);
        const expectedAmt = expected === null ? null : round2(expected * p.pricePerLitre);
        return {
          pumpId: p.pumpId,
          pumpName: p.pumpName,
          product,
          openingReading: p.openingReading,
          closingReading: p.closingReading,
          pricePerLitre: p.pricePerLitre,
          actualLitres: p.litresSold,
          actualAmount: p.amount,
          expectedLitres: expected,
          expectedAmount: expectedAmt,
          varianceLitres: expected === null ? null : round2(p.litresSold - expected),
          varianceAmount: expectedAmt === null ? null : round2(p.amount - expectedAmt),
        };
      }),
    });
  }

  const totals = lines.reduce<Totals>(
    (t, l) => ({
      expectedLitres: round2(t.expectedLitres + l.expectedLitres),
      actualLitres: round2(t.actualLitres + l.actualLitres),
      varianceLitres: round2(t.varianceLitres + l.varianceLitres),
      expectedAmount: round2(t.expectedAmount + l.expectedAmount),
      actualAmount: round2(t.actualAmount + l.actualAmount),
      varianceAmount: round2(t.varianceAmount + l.varianceAmount),
    }),
    { expectedLitres: 0, actualLitres: 0, varianceLitres: 0, expectedAmount: 0, actualAmount: 0, varianceAmount: 0 },
  );

  return {
    id: record.id,
    stationId: record.stationId,
    recordedOn: record.recordedOn,
    notes: record.notes,
    recordedById: record.recordedById,
    recordedByUsername: record.recordedByUsername,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    products: lines,
    totals,
  };
}
