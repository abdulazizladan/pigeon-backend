import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/enums/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Analytics')
@Controller('analytics')
// @UseGuards(AuthGuard('jwt'), RolesGuard) // Commented out for now if strict auth isn't required for mock or if user/roles setup is complex, but standard practice is to include it. User requested endpoints to be mocked, so keeping it simple but documented.
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('sales/monthly-comparison')
    //@Roles(Role.director, Role.admin)
    @ApiOperation({ summary: 'Get Monthly Sales Comparison' })
    @ApiOkResponse({ description: 'Returns comparison of current month vs last month sales.' })
    getMonthlySalesComparison() {
        return this.analyticsService.getMonthlySalesComparison();
    }

    @Get('sales/trend/30-days')
    //@Roles(Role.director, Role.admin)
    @ApiOperation({ summary: 'Get 30-Day Sales Trend' })
    @ApiOkResponse({ description: 'Returns daily sales trend for petrol and diesel for the last 30 days.' })
    getSalesTrend30Days() {
        return this.analyticsService.getSalesTrend30Days();
    }

    @Get('sales/product-comparison')
    //@Roles(Role.director, Role.admin)
    @ApiOperation({ summary: 'Get Product Comparison' })
    @ApiOkResponse({ description: 'Returns total volume comparison between petrol and diesel.' })
    getProductComparison() {
        return this.analyticsService.getProductComparison();
    }

    @Get('stations/performance/yesterday')
    //@Roles(Role.director, Role.admin)
    @ApiOperation({ summary: 'Get Top/Bottom Stations Performance (Yesterday)' })
    @ApiOkResponse({ description: 'Returns top 3 and bottom 3 stations by sales for yesterday.' })
    getStationsPerformanceYesterday() {
        return this.analyticsService.getStationsPerformanceYesterday();
    }

    @Get('sales/stats')
    //@Roles(Role.director, Role.admin)
    @ApiOperation({ summary: 'Get Daily Sales Statistics' })
    @ApiOkResponse({ description: 'Returns total sales for this month, and total volumes sold today (overall, petrol, diesel).' })
    getDailyStats() {
        return this.analyticsService.getDailyStats();
    }

    @Get('sales/station-daily-trend')
    //@Roles(Role.director, Role.admin)
    @ApiOperation({ summary: 'Get Daily Sales by Station (Last 30 Days)' })
    @ApiOkResponse({ description: 'Returns list of stations with their daily sales history for the last 30 days.' })
    getDailySalesByStation() {
        return this.analyticsService.getDailySalesByStation();
    }
}
