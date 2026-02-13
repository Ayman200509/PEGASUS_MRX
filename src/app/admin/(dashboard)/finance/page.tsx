"use client";

import { getData } from "@/lib/db";
import { DollarSign, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function FinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // In a real app, this would be a server component or API call
                // For now, we'll simulate fetching via an API route or server action pattern
                // Since getData is server-side only in typical Next.js structure if it uses fs directly,
                // we might need an API route. But let's check if we can reuse the support API pattern 
                // or just fetch from the existing /api/support for now? 
                // Actually, I should probably create a specific API or just use the existing server data pattern.
                // However, since 'getData' uses 'fs', it can't be called directly in 'use client'.
                // I will fetch from /api/support since it returns the whole data object anyway given my previous implementation,
                // OR I can create a new simple API. 
                // Let's create a quick server action or just use the existing /api/support to get the data 
                // since it returns { tickets: ... } but maybe I can modify it or just creating /api/finance is cleaner.

                // Let's assume I need to Create /api/finance/route.ts first? 
                // Or I can just disable "use client" and make this a Server Component?
                // The rechart library is client-side. So I need a client component wrapper or data fetching in server component.
                // Let's make the Page a Server Component and pass data to a Client Component "FinanceDashboard".
                // But to be quick and consistent with the previous "SupportPage" which was "use client", 
                // I'll stick to client-side fetching. I'll create /api/finance/route.ts first.

                const res = await fetch("/api/finance");
                if (res.ok) {
                    const jsonData = await res.json();
                    setData(jsonData);
                }
            } catch (error) {
                console.error("Failed to load finance data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                    <p className="text-xs uppercase tracking-wider font-bold">Loading Financial Data...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Calculate Metrics
    const orders = data.orders || [];
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total.replace(/[^0-9.]/g, '')), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // --- Trend Calculations (This Month vs Last Month) ---
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const getMonthData = (monthOffset: number) => {
        const targetDate = new Date(currentYear, currentMonth - monthOffset, 1);
        const tMonth = targetDate.getMonth();
        const tYear = targetDate.getFullYear();

        const monthOrders = orders.filter((o: any) => {
            const d = new Date(o.date);
            return d.getMonth() === tMonth && d.getFullYear() === tYear;
        });

        const rev = monthOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total.replace(/[^0-9.]/g, '')), 0);
        const count = monthOrders.length;
        const aov = count > 0 ? rev / count : 0;
        return { rev, count, aov };
    };

    const currentData = getMonthData(0); // This Month
    const prevData = getMonthData(1);    // Last Month

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(currentData.rev, prevData.rev);
    const ordersChange = calculateChange(currentData.count, prevData.count);
    const aovChange = calculateChange(currentData.aov, prevData.aov);

    const formatChange = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

    // Real Chart Data: Revenue Last 7 Days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            date: d.toISOString().split('T')[0], // YYYY-MM-DD
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' })
        };
    });

    const revenueData = last7Days.map(day => {
        const dayRevenue = orders
            .filter((o: any) => o.date.startsWith(day.date))
            .reduce((sum: number, o: any) => sum + parseFloat(o.total.replace(/[^0-9.]/g, '')), 0);
        return { name: day.dayName, revenue: dayRevenue };
    });

    // Real Chart Data: Sales by Product Type (acting as Category)
    // We need to look up product types from the product ID in the order items if not stored directly
    // But Order items have 'title'. We might need to map them back to products or just use 'title' if types aren't available easily.
    // However, data.products is available!
    const productsMap = new Map((data.products || []).map((p: any) => [p.id, p]));

    type CategoryCount = { [key: string]: number };
    const categoryCounts: CategoryCount = {};

    orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
            const product = productsMap.get(item.productId);
            // Default to 'Service' or 'Other' if product not found (deleted)
            const type = product ? product.type : "Other";
            categoryCounts[type] = (categoryCounts[type] || 0) + 1;
        });
    });

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    // Fallback for empty data
    if (categoryData.length === 0) {
        categoryData.push({ name: "No Sales", value: 1 });
    }

    const COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5'];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">FINANCE</h1>
                    <p className="text-gray-500 text-sm mt-1">overview & performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2">
                        <Calendar size={14} />
                        THIS MONTH
                    </button>
                    <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center gap-2">
                        <CreditCard size={14} />
                        WITHDRAW
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    change={formatChange(revenueChange)}
                    isNegative={revenueChange < 0}
                    icon={<DollarSign size={20} className="text-red-500" />}
                />
                <MetricCard
                    title="Total Orders"
                    value={totalOrders.toString()}
                    change={formatChange(ordersChange)}
                    isNegative={ordersChange < 0}
                    icon={<ShoppingBag size={20} className="text-blue-500" />}
                />
                <MetricCard
                    title="Average Order Value"
                    value={`$${averageOrderValue.toFixed(2)}`}
                    change={formatChange(aovChange)}
                    isNegative={aovChange < 0}
                    icon={<TrendingUp size={20} className="text-emerald-500" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-[#101014] border border-white/5 rounded-3xl p-6 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 relative z-10">
                        Revenue Trend
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-normal">Last 7 Days</span>
                    </h3>
                    <div className="h-[300px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#dc2626"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Chart */}
                <div className="bg-[#101014] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-bl from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-white font-bold mb-6 relative z-10">Sales by Category</h3>
                    <div className="h-[300px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                            {categoryData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#101014] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <h3 className="text-white font-bold mb-6">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-white/5">
                                <th className="pb-4 font-bold uppercase tracking-wider pl-4">Order ID</th>
                                <th className="pb-4 font-bold uppercase tracking-wider">Customer</th>
                                <th className="pb-4 font-bold uppercase tracking-wider">Date</th>
                                <th className="pb-4 font-bold uppercase tracking-wider">Amount</th>
                                <th className="pb-4 font-bold uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.slice(0, 5).map((order: any) => (
                                <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4 font-mono text-sm text-gray-300">{order.id}</td>
                                    <td className="py-4 text-sm text-white font-bold">{order.customerEmail}</td>
                                    <td className="py-4 text-sm text-gray-500">{order.date}</td>
                                    <td className="py-4 text-sm text-white font-bold">{order.total}</td>
                                    <td className="py-4">
                                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wider">
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                                        No recent transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, icon, isNegative }: { title: string, value: string, change: string, icon: any, isNegative?: boolean }) {
    return (
        <div className="bg-[#101014] border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-[160px] relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-white/5 rounded-2xl text-white">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isNegative ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {isNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                    {change}
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h2 className="text-3xl font-black text-white">{value}</h2>
            </div>
        </div>
    );
}
