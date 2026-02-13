import { getData } from '@/lib/db';
import { Check, ArrowRight, MessageSquare, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ orderId: string }> }) {
    const resolvedSearchParams = await searchParams;
    const { orderId } = resolvedSearchParams;

    if (!orderId) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <p>Invalid Order ID</p>
            </div>
        );
    }

    const data = await getData();
    const order = data.orders.find(o => o.id === orderId);

    if (!order) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-32">

                {/* Success Card */}
                <div className="glass-panel p-8 md:p-12 rounded-3xl text-center mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-purple-600 to-red-600 animate-gradient" />

                    <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                        <Check size={48} className="text-green-500" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Order Confirmed!</h1>
                    <p className="text-gray-400 text-lg mb-8">
                        Thank you for your purchase. Your order <span className="text-white font-mono font-bold">#{orderId}</span> has been received.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/5 transition-all flex items-center gap-2"
                        >
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* Items & Feedback */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <MessageSquare className="text-red-500" />
                        Leave Feedback
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Tell us about your purchase! Your reviews help others make better decisions.
                    </p>

                    <div className="grid gap-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-red-500/30 transition-all">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-16 h-16 rounded-xl bg-[#0a0a0c] flex items-center justify-center font-bold text-gray-700 text-xl border border-white/5">
                                        {item.title.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-sm text-gray-500">${item.price}</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/product/${item.productId}?review=true`}
                                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-2 group-hover:scale-105"
                                >
                                    Write a Review <ArrowRight size={18} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
