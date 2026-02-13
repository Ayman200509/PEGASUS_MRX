"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Order } from "@/lib/db";

export function RecentOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => {
                if (!res.ok) {
                    console.error("Failed to fetch recent orders:", res.status);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    console.warn("RecentOrders API did not return an array:", data);
                    setOrders([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("RecentOrders fetch error:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="glass-panel p-6 rounded-3xl mt-8 animate-pulse h-48"></div>;

    if (orders.length === 0) {
        return (
            <div className="glass-panel p-6 rounded-3xl mt-8">
                <h3 className="text-white font-bold text-lg tracking-tight mb-4">Recent Orders</h3>
                <div className="text-center py-12 text-gray-500 text-sm">
                    No orders yet.
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-3xl mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg tracking-tight">Recent Orders</h3>
                <Link href="/admin/orders" className="text-xs font-bold text-red-500 hover:text-white transition-colors uppercase tracking-widest">View All</Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                            <th className="pb-4 font-bold">Order ID</th>
                            <th className="pb-4 font-bold">Customer</th>
                            <th className="pb-4 font-bold">Product</th>
                            <th className="pb-4 font-bold">Amount</th>
                            <th className="pb-4 font-bold">Status</th>
                            <th className="pb-4 font-bold text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4 text-xs font-mono text-gray-400 group-hover:text-white transition-colors">
                                    {order.id.substring(0, 8)}
                                </td>
                                <td className="py-4 text-sm font-bold text-white">
                                    <div className="flex flex-col">
                                        <span className="text-white">{order.customerEmail}</span>
                                        <span className="text-xs text-gray-500">{order.customerTelegram}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-sm text-gray-300">
                                    {(order.items || []).map(i => `${i.title} (x${i.quantity})`).join(", ")}
                                </td>
                                <td className="py-4 text-sm font-bold text-white">${order.total}</td>
                                <td className="py-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${order.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                        order.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                            "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 text-xs text-gray-500 text-right">
                                    {new Date(order.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
