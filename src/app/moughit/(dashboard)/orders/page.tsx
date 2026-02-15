"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Filter, Trash2, Eye, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { Order } from "@/lib/db";
import { OrderDetailModal } from "./OrderDetailModal";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const syncOrders = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/orders/sync', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                if (data.updated > 0) {
                    alert(`Synced successfully! Updated ${data.updated} orders.`);
                    fetchOrders(); // Refresh list
                } else {
                    alert("Sync complete. No status updates found.");
                }
            } else {
                alert("Sync failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Sync error:", error);
            alert("Failed to sync orders.");
        } finally {
            setIsSyncing(false);
        }
    };

    // Initial fetch and Live Polling setup
    useEffect(() => {
        fetchOrders();

        // Poll every 5 seconds for live updates
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async (isBackground = false) => {
        if (!isBackground) setIsRefreshing(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();

            if (Array.isArray(data)) {
                // Sort by date descending (newest first)
                const sortedData = data.sort((a: Order, b: Order) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setOrders(sortedData);
            } else {
                console.warn("Orders API did not return an array:", data);
                setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            if (!isBackground) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove from local state immediately
                setOrders(prev => prev.filter(order => order.id !== id));
            } else {
                alert("Failed to delete order");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Error deleting order");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("⚠️ DANGER: This will delete ALL orders permanently.\n\nAre you sure you want to proceed?")) return;
        if (!confirm("Really? This cannot be undone.")) return;

        try {
            const res = await fetch('/api/admin/orders/clear', {
                method: 'DELETE',
            });

            if (res.ok) {
                setOrders([]);
                alert("All orders have been cleared.");
            } else {
                alert("Failed to clear orders.");
            }
        } catch (error) {
            console.error("Error clearing orders:", error);
            alert("Error clearing orders.");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.total.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = false;
        if (statusFilter === "ALL") {
            matchesStatus = true;
        } else if (statusFilter === "PENDING") {
            matchesStatus = order.status === "Pending Payment";
        } else if (statusFilter === "PAID") {
            matchesStatus = order.status === "Completed";
        } else if (statusFilter === "CANCELED") {
            matchesStatus = order.status === "Canceled" || order.status === "Expired";
        }

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        if (s === 'COMPLETED' || s === 'PAID') return 'bg-green-500/10 text-green-500 border-green-500/20';
        if (s === 'PENDING PAYMENT' || s === 'PENDING') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        if (s === 'CANCELED' || s === 'EXPIRED') return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    const getStatusIcon = (status: string) => {
        const s = status.toUpperCase();
        if (s === 'COMPLETED' || s === 'PAID') return <CheckCircle size={14} />;
        if (s === 'PENDING PAYMENT' || s === 'PENDING') return <Clock size={14} />;
        if (s === 'CANCELED' || s === 'EXPIRED') return <XCircle size={14} />;
        return <Clock size={14} />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Orders</h1>
                    <p className="text-gray-400 text-sm mt-1">View and manage your order history</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleClearAll}
                        className="bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                        title="Delete All Orders"
                    >
                        <Trash2 size={16} />
                        Clear All
                    </button>
                    <button
                        onClick={syncOrders}
                        className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSyncing}
                    >
                        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? "Syncing..." : "Sync Status"}
                    </button>
                    <button
                        onClick={() => fetchOrders()}
                        className={`bg-[#0a0a0c] hover:bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search invoice, email, product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 bg-[#0a0a0c] p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
                    {["ALL", "PENDING", "PAID", "CANCELED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === status
                                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="glass-panel rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                                <th className="py-4 pl-6 font-bold">Order ID</th>
                                <th className="py-4 font-bold">Customer</th>
                                <th className="py-4 font-bold">Date</th>
                                <th className="py-4 font-bold">Total</th>
                                <th className="py-4 font-bold">Status</th>
                                <th className="py-4 font-bold">Visitor</th>
                                <th className="py-4 pr-6 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                                        {/* Order ID & Icon */}
                                        <td className="py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-gray-400">
                                                    <Filter size={16} />
                                                </div>
                                                <div>
                                                    <span className="block text-white font-bold font-mono">#{order.id.slice(0, 8)}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">INV-{order.id.slice(-4)}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{order.customerEmail}</span>
                                                <span className="text-xs text-red-500">@{order.customerTelegram}</span>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="py-4 text-gray-400 text-sm">
                                            {new Date(order.date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>

                                        {/* Total */}
                                        <td className="py-4">
                                            <span className="text-white font-black tracking-tight">{order.total}</span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </td>

                                        {/* Visitor Info */}
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                {order.country && order.country !== 'Unknown' ? (
                                                    <img
                                                        src={`https://flagcdn.com/24x18/${order.country.toLowerCase()}.png`}
                                                        alt={order.country}
                                                        className="rounded-sm w-4 h-3 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-3 bg-white/5 border border-white/10 rounded-sm" title="Legacy Order" />
                                                )}
                                                <span className="text-[10px] font-mono text-gray-500">{order.ip || "?.?.?.?"}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
}
