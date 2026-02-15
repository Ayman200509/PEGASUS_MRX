"use client";

import { DollarSign, ShoppingCart, Package, Eye } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: "...",
        orders: 0,
        products: 0,
        revenueTrend: "...",
        ordersTrend: "...",
        revenueTrendUp: true,
        ordersTrendUp: true,
        salesCount: 0,
        reviewsCount: 0
    });

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [liveViews, setLiveViews] = useState(0);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setStats(data);
            })
            .catch(err => console.error("Stats fetch error:", err));

        // Poll for live views
        const fetchLiveViews = () => {
            fetch('/api/analytics/live')
                .then(res => res.json())
                .then(data => {
                    if (data && data.count !== undefined) setLiveViews(data.count);
                })
                .catch(err => console.error("Live views fetch error:", err));
        };

        fetchLiveViews();
        const interval = setInterval(fetchLiveViews, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const updateStat = async (key: string, value: number) => {
        // Optimistic update
        setStats(prev => ({ ...prev, [key]: value }));
        setIsSaving(true);

        try {
            await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value })
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Failed to update stat", error);
            // Revert on error could be implemented here if needed
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">Welcome back to your store overview.</p>
                </div>
                <Link href="/admin/products" className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center">
                    + New Product
                </Link>
            </div>



            {/* Quick Stats Edit (Faking) */}
            <div className="mb-8 p-6 bg-red-900/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-6 hover:bg-red-900/20 transition-all group">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Live Store Stats
                    </h3>
                    <div className="flex flex-col mt-1">
                        <p className="text-xs text-red-200/60">
                            Edit the public facing numbers instantly.
                        </p>
                        {isSaving ? (
                            <span className="text-[10px] text-yellow-500 font-bold mt-1 animate-pulse">Saving...</span>
                        ) : lastSaved ? (
                            <span className="text-[10px] text-green-500 font-bold mt-1 animate-in fade-in">Saved!</span>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Public Sales Count</label>
                        <input
                            type="number"
                            value={stats.salesCount || 0}
                            onChange={(e) => updateStat('salesCount', parseInt(e.target.value))}
                            className="bg-black/40 border border-red-500/30 rounded-lg py-2 px-3 text-white w-32 font-mono focus:outline-none focus:border-red-500 transition-all text-center font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Revenue"
                    value={stats.revenue}
                    icon={DollarSign}
                    trend={stats.revenueTrend}
                    trendUp={stats.revenueTrendUp}
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.orders.toString()}
                    icon={ShoppingCart}
                    trend={stats.ordersTrend}
                    trendUp={stats.ordersTrendUp}
                />
                <div className="relative">
                    <div className="absolute top-2 right-2 text-[10px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        LIVE
                    </div>
                    <StatsCard
                        title="Today's Views"
                        value={liveViews.toString()}
                        icon={Eye}
                    />
                </div>
                <StatsCard
                    title="Active Products"
                    value={stats.products.toString()}
                    icon={Package}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                {/* @ts-ignore */}
                {stats.chartData && <RevenueChart data={stats.chartData} />}

                {/* Orders Chart */}
                {/* @ts-ignore */}
                {stats.ordersChartData && <OrdersChart data={stats.ordersChartData} />}
            </div>

            <RecentOrders />
        </div>
    );
}
