import { buildDailyReport } from './sales-report';
import { DailyRecord } from './entities/daily-record.entity';
import { PumpReading } from './entities/pump-reading.entity';
import { ReservoirReading } from './entities/reservoir-reading.entity';
import { Product } from '../products/product.enum';

const record = {
  id: 'rec-1',
  stationId: 'st-1',
  recordedOn: '2026-10-07',
  notes: null,
  recordedById: 'u-1',
  recordedByUsername: 'manager',
  createdAt: new Date('2026-10-07T18:00:00Z'),
  updatedAt: new Date('2026-10-07T18:00:00Z'),
} as DailyRecord;

const pump = (id: string, product: Product, opening: number, closing: number, price: number): PumpReading =>
  ({
    id: `pr-${id}`,
    recordId: record.id,
    stationId: record.stationId,
    recordedOn: record.recordedOn,
    pumpId: id,
    pumpName: `Pump ${id}`,
    product,
    openingReading: opening,
    closingReading: closing,
    litresSold: closing - opening,
    pricePerLitre: price,
    amount: (closing - opening) * price,
  });

const tank = (id: string, product: Product, opening: number, delivered: number, closing: number): ReservoirReading =>
  ({
    id: `rr-${id}`,
    recordId: record.id,
    stationId: record.stationId,
    recordedOn: record.recordedOn,
    reservoirId: id,
    product,
    openingLevel: opening,
    deliveredLitres: delivered,
    closingLevel: closing,
    expectedLitres: opening + delivered - closing,
  });

describe('buildDailyReport', () => {
  it('shares the reservoir drop equally between pumps and reports the variance per pump and per product', () => {
    const report = buildDailyReport(
      record,
      [pump('1', Product.PETROL, 1000, 2000, 880), pump('2', Product.PETROL, 5000, 6500, 880)],
      [tank('t1', Product.PETROL, 20000, 0, 17400)],
    );

    expect(report.products).toHaveLength(1);
    const petrol = report.products[0];
    expect(petrol.product).toBe(Product.PETROL);
    expect(petrol.expectedLitres).toBe(2600);
    expect(petrol.actualLitres).toBe(2500);
    expect(petrol.varianceLitres).toBe(-100);
    expect(petrol.expectedAmount).toBe(2600 * 880);
    expect(petrol.actualAmount).toBe(2500 * 880);
    expect(petrol.varianceAmount).toBe(-100 * 880);

    const [p1, p2] = petrol.pumps;
    expect(p1.expectedLitres).toBe(1300);
    expect(p1.actualLitres).toBe(1000);
    expect(p1.varianceLitres).toBe(-300);
    expect(p1.varianceAmount).toBe(-300 * 880);
    expect(p2.expectedLitres).toBe(1300);
    expect(p2.actualLitres).toBe(1500);
    expect(p2.varianceLitres).toBe(200);

    expect(report.totals).toEqual({
      expectedLitres: 2600,
      actualLitres: 2500,
      varianceLitres: -100,
      expectedAmount: 2288000,
      actualAmount: 2200000,
      varianceAmount: -88000,
    });
  });

  it('counts a delivery as stock that should have been sold', () => {
    const report = buildDailyReport(
      record,
      [pump('3', Product.DIESEL, 100, 1100, 1150)],
      [tank('t2', Product.DIESEL, 3000, 10000, 12000)],
    );
    const diesel = report.products[0];
    expect(diesel.expectedLitres).toBe(1000);
    expect(diesel.actualLitres).toBe(1000);
    expect(diesel.varianceLitres).toBe(0);
  });

  it('leaves per-pump expectations null when the reservoir was not read, and rolls products into totals', () => {
    const report = buildDailyReport(
      record,
      [pump('1', Product.PETROL, 0, 100, 880), pump('4', Product.KEROSENE, 0, 50, 1600)],
      [tank('t1', Product.PETROL, 1000, 0, 900)],
    );

    const kerosene = report.products.find((p) => p.product === Product.KEROSENE)!;
    expect(kerosene.reservoir).toBeNull();
    expect(kerosene.expectedLitres).toBe(0);
    expect(kerosene.pumps[0].expectedLitres).toBeNull();
    expect(kerosene.pumps[0].varianceAmount).toBeNull();

    expect(report.totals.actualLitres).toBe(150);
    expect(report.totals.expectedLitres).toBe(100);
    expect(report.totals.actualAmount).toBe(100 * 880 + 50 * 1600);
  });
});
