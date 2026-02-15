import { getData } from '@/lib/db';
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ReviewForm } from "@/components/ReviewForm";
import { ShoppingBag, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function OrderReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;

    if (!orderId) return notFound();

    const data = await getData();
    const order = data.orders.find(o => o.id === orderId);

    if (!order) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                    <Link href="/" className="text-red-500 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-32">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-4">Order Confirmed!</h1>
                    <p className="text-gray-400 text-lg">
                        Order <span className="text-white font-mono">#{orderId}</span> has been successfully placed.
                    </p>
                    <p className="text-gray-500 mt-2 text-sm">
                        Thank you for your trust. Please take a moment to review your purchased items.
                    </p>
                </div>

                <div className="grid gap-8">
                    {order.items.map((item, index) => (
                        <div key={index} className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Product Info */}
                                <div className="md:w-1/3 space-y-4">
                                    <div className="aspect-square rounded-2xl bg-[#0a0a0c] border border-white/5 flex items-center justify-center text-4xl font-black text-gray-800">
                                        {item.title.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{item.title}</h3>
                                        <p className="text-red-500 font-bold mt-1">${item.price}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        How was your experience with this product? Your feedback helps others!
                                    </div>
                                </div>

                                {/* Review Form */}
                                <div className="md:w-2/3">
                                    <ReviewForm productId={item.productId} productName={item.title} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} />
                        Back to Store
                    </Link>
                </div>
            </div>
        </div>
    );
}
