import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from 'src/sale/entities/sale.entity';
import { Station } from 'src/station/entities/station.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {

    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>,
    ) { }

    /**
     * Compares current month's total sales (revenue) with last month's.
     */
    async getMonthlySalesComparison() {
        const today = new Date();

        // Current Month Range
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        // Last Month Range
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        try {
            // Current Month Total
            const currentMonthResult = await this.saleRepository
                .createQueryBuilder('sale')
                .select('SUM(sale.totalPrice)', 'total')
                .where('sale.createdAt BETWEEN :start AND :end', { start: startOfCurrentMonth, end: endOfCurrentMonth })
                .getRawOne();

            const currentMonthTotal = currentMonthResult && currentMonthResult.total ? parseFloat(currentMonthResult.total) : 0;

            // Last Month Total
            const lastMonthResult = await this.saleRepository
                .createQueryBuilder('sale')
                .select('SUM(sale.totalPrice)', 'total')
                .where('sale.createdAt BETWEEN :start AND :end', { start: startOfLastMonth, end: endOfLastMonth })
                .getRawOne();

            const lastMonthTotal = lastMonthResult && lastMonthResult.total ? parseFloat(lastMonthResult.total) : 0;

            // Percentage Change
            let percentageChange = 0;
            if (lastMonthTotal > 0) {
                percentageChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
            } else if (currentMonthTotal > 0) {
                percentageChange = 100; // if last month was 0 and this month > 0, technically infinite increase, but 100% or handling as new growth is common
            }

            return {
                currentMonthTotal,
                lastMonthTotal,
                percentageChange: parseFloat(percentageChange.toFixed(2))
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Retrieves daily sales trend (revenue) for the last 30 days, separated by product.
     */
    async getSalesTrend30Days() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            const salesData = await this.saleRepository
                .createQueryBuilder('sale')
                .select('DATE(sale.createdAt)', 'date')
                .addSelect('sale.product', 'product')
                .addSelect('SUM(sale.totalPrice)', 'dailyRevenue')
                .where('sale.createdAt >= :startDate', { startDate: thirtyDaysAgo })
                .groupBy('DATE(sale.createdAt)')
                .addGroupBy('sale.product')
                .orderBy('date', 'ASC')
                .getRawMany();

            // Process Data
            const dateMap = new Map<string, { petrol: number; diesel: number }>();

            // Initialize last 30 days with 0
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                dateMap.set(dateStr, { petrol: 0, diesel: 0 });
            }

            salesData.forEach(record => {
                const dateStr = typeof record.date === 'string' ? record.date.substring(0, 10) : record.date.toISOString().substring(0, 10);
                if (dateMap.has(dateStr)) {
                    const entry = dateMap.get(dateStr);
                    const amount = parseFloat(record.dailyRevenue);
                    if (record.product === 'PETROL') entry.petrol += amount;
                    else if (record.product === 'DIESEL') entry.diesel += amount;
                }
            });

            const result = [];
            dateMap.forEach((values, date) => {
                result.push({ date, ...values });
            });

            return result;

        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Compares total volume sold (liters) between Petrol and Diesel for the last 30 days.
     */
    async getProductComparison() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            const result = await this.saleRepository
                .createQueryBuilder('sale')
                .select('sale.product', 'product')
                // Calculate Volume: closing - opening. 
                // Note: If meter resets, this logic needs handling, but assuming standard increasing meter here.
                .addSelect('SUM(sale.closingMeterReading - sale.openingMeterReading)', 'totalVolume')
                .where('sale.createdAt >= :startDate', { startDate: thirtyDaysAgo })
                .groupBy('sale.product')
                .getRawMany();

            let petrolTotalVolume = 0;
            let dieselTotalVolume = 0;

            result.forEach(row => {
                const vol = parseFloat(row.totalVolume);
                if (row.product === 'PETROL') petrolTotalVolume = vol;
                else if (row.product === 'DIESEL') dieselTotalVolume = vol;
            });

            return {
                petrolTotalVolume,
                dieselTotalVolume
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    /**
     * Retrieves top 3 and bottom 3 stations based on *yesterday's* total sales (revenue).
     */
    async getStationsPerformanceYesterday() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        try {
            const ranking = await this.saleRepository
                .createQueryBuilder('sale')
                .innerJoin('sale.station', 'station')
                .select('station.name', 'stationName')
                .addSelect('SUM(sale.totalPrice)', 'totalSales')
                .where('sale.createdAt BETWEEN :start AND :end', { start: startOfYesterday, end: endOfYesterday })
                .groupBy('station.name') // Ensure station names are unique enough or group by ID and generic name
                .orderBy('totalSales', 'DESC')
                .getRawMany();

            // Convert string totals to numbers
            const formattedRanking = ranking.map(item => ({
                stationName: item.stationName,
                totalSales: parseFloat(item.totalSales)
            }));

            const top3 = formattedRanking.slice(0, 3);
            // Bottom 3: take last 3 and reverse to show worst first? Or just list them? 
            // User asked for "Bottom 3". Usually implies lowest performers.
            // If array is [100, 80, 50, 20, 10], bottom 3 are 10, 20, 50.
            // slice(-3) gives [50, 20, 10]. Reverse for clarity if needed, but endpoint just returns array.
            // I will return them in ascending order (lowest first) implicitly if sliced from end of DESC list? 
            // Wait, DESC list: [High ... Low]. Slice(-3) gives the last 3 (Lowest). 
            // Example: [100, 90, 80, 30, 20, 10]. Slice(-3) -> [30, 20, 10]. 
            // Correct.
            const bottom3 = formattedRanking.length >= 3 ? formattedRanking.slice(-3) : [];
            // If total < 3, bottom3 might duplicate top3 or be empty logic? 
            // If < 6 items, overlap occurs. That's inherent to "Top 3 / Bottom 3" on small sets. 
            // Providing exactly as logic suggests.

            return {
                top3,
                bottom3
            };

        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
