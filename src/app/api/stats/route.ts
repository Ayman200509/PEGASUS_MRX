import { NextResponse } from 'next/server';
import { getData } from '@/lib/db';

export async function GET() {
    try {
        const data = await getData();
        const orders = data.orders || [];
        const products = data.products || [];

        // 1. Calculate Total Revenue
        const totalRevenue = orders
            .filter(o => o.status === 'Completed')
            .reduce((acc, order) => {
                const val = parseFloat(order.total);
                return isNaN(val) ? acc : acc + val;
            }, 0);

        // 2. Calculate Revenue Growth (Month over Month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Last month calculation handling year wrap
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const currentMonthRevenue = orders
            .filter(o => {
                const d = new Date(o.date);
                return o.status === 'Completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((acc, o) => {
                const val = parseFloat(o.total);
                return isNaN(val) ? acc : acc + val;
            }, 0);

        const lastMonthRevenue = orders
            .filter(o => {
                const d = new Date(o.date);
                return o.status === 'Completed' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
            })
            .reduce((acc, o) => {
                const val = parseFloat(o.total);
                return isNaN(val) ? acc : acc + val;
            }, 0);

        let revenueGrowth = 0;
        if (lastMonthRevenue > 0) {
            revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        } else if (currentMonthRevenue > 0) {
            revenueGrowth = 100;
        }

        // 3. New Orders Today
        const todayAtZero = new Date();
        todayAtZero.setHours(0, 0, 0, 0);
        const newOrdersToday = orders.filter(o => new Date(o.date) >= todayAtZero).length;

        // 4. Calculate Last 7 Days Data for Charts
        const chartData = [];
        const ordersChartData = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const dayOrders = orders.filter(o => {
                const od = new Date(o.date);
                return od >= d && od < nextDay;
            });

            const dailyRevenue = dayOrders
                .filter(o => o.status === 'Completed')
                .reduce((acc, o) => {
                    const val = parseFloat(o.total);
                    return isNaN(val) ? acc : acc + val;
                }, 0);
            const dailyOrdersCount = dayOrders.length;

            chartData.push({
                name: dateStr,
                value: dailyRevenue
            });

            ordersChartData.push({
                name: dateStr,
                value: dailyOrdersCount
            });
        }

        const stats = {
            revenue: `$${totalRevenue.toFixed(2)}`,
            orders: orders.length,
            products: products.length,
            balance: `$${totalRevenue.toFixed(2)}`,

            // Trends
            revenueTrend: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(0)}% from last month`,
            ordersTrend: `+${newOrdersToday} new today`,

            // Boolean flags for colors (green/red)
            revenueTrendUp: revenueGrowth >= 0,
            ordersTrendUp: newOrdersToday > 0,

            // Chart Data
            chartData,
            ordersChartData,

            // Raw Counts for Editing
            salesCount: data.profile.salesCount || 0,
            reviewsCount: data.reviews ? data.reviews.length : 0
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: "Failed to calculate statistics" }, { status: 500 });
    }
}
