"use client";

import { X, Mail, Send as SendIcon, Package, Calendar, Tag, CreditCard, Hash } from "lucide-react";
import { Order } from "@/lib/db";

interface OrderDetailModalProps {
    order: Order | null;
    onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
    if (!order) return null;

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        if (s === 'COMPLETED' || s === 'PAID') return 'bg-green-500/10 text-green-500 border-green-500/20';
        if (s === 'PENDING PAYMENT' || s === 'PENDING') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        if (s === 'CANCELED' || s === 'EXPIRED') return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-panel p-0 rounded-3xl max-w-2xl w-full relative overflow-hidden animate-in zoom-in duration-300 shadow-2xl border border-white/10">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">ORDER DETAILS</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Hash size={18} className="text-gray-500" />
                            {order.id}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
                    <div className="p-6 space-y-8">
                        {/* Customer & Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Tag size={12} className="text-red-500" />
                                    Customer Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                                <Mail size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Email Address</p>
                                                <p className="text-sm text-white font-medium">{order.customerEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <SendIcon size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Telegram ID</p>
                                                <p className="text-sm text-white font-medium">@{order.customerTelegram.replace('@', '')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} className="text-red-500" />
                                    Order Metadata
                                </h3>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">Placed On</span>
                                        <span className="text-xs text-white">
                                            {new Date(order.date).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">Payment Method</span>
                                        <div className="flex items-center gap-1.5 text-xs text-white">
                                            <CreditCard size={12} className="text-gray-500" />
                                            OxaPay (Crypto)
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold">IP Address</span>
                                            <span className="text-xs text-blue-400 font-mono">{order.ip || 'Not recorded (Legacy)'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Country</span>
                                            <div className="flex items-center gap-2">
                                                {order.country && order.country !== 'Unknown' ? (
                                                    <>
                                                        <img
                                                            src={`https://flagcdn.com/24x18/${order.country.toLowerCase()}.png`}
                                                            alt={order.country}
                                                            className="rounded-sm"
                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                        />
                                                        <span className="text-xs text-white font-bold">{order.country}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-500 italic">Unknown</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Package size={14} className="text-red-500" />
                                Purchased Items
                            </h3>
                            <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                                            <th className="py-3 px-4 font-bold">Product</th>
                                            <th className="py-3 px-4 font-bold text-center">Qty</th>
                                            <th className="py-3 px-4 font-bold text-right">Price</th>
                                            <th className="py-3 px-4 font-bold text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {order.items.map((item, idx) => (
                                            <tr key={`${item.productId}-${idx}`} className="text-sm">
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <p className="font-bold text-white leading-none mb-1">{item.title}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono">ID: {item.productId}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center text-gray-300 font-medium">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-300 font-medium">
                                                    ${item.price}
                                                </td>
                                                <td className="py-4 px-4 text-right text-white font-bold">
                                                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-white/[0.02]">
                                        <tr>
                                            <td colSpan={3} className="py-4 px-4 text-right text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                Total Amount
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className="text-xl font-black text-red-500 tracking-tighter">
                                                    ${order.total}
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <p className="text-[10px] text-gray-600 font-medium">
                        Order processed securely via PEGASUS MRX infrastructure.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all border border-white/10 shadow-lg"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
