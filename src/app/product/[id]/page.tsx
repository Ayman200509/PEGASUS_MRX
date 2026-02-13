import { getData } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ShoppingCart, Shield, Zap, Globe, Play } from "lucide-react";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Navbar } from "@/components/Navbar";
import { ProductClientWrapper } from "@/components/ProductClientWrapper";
import { ProductMedia } from "@/components/ProductMedia";
import { ReviewsSection } from "@/components/ReviewsSection";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const data = await getData();
    const productId = decodeURIComponent(resolvedParams.id);

    // Find by ID or by slugified title
    const product = data.products.find(p => p.id === productId) ||
        data.products.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === productId);

    if (!product) {
        notFound();
    }

    return (
        <ProductClientWrapper>
            <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 pt-32">
                <div className="max-w-6xl mx-auto">
                    <div className="relative z-[999]">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group cursor-pointer"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Store
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Section */}
                        <div className="space-y-6">
                            <ProductMedia
                                mainImage={product.image || ""}
                                title={product.title}
                                imageColor={product.imageColor}
                                images={product.images}
                                videos={product.videos}
                                type={product.type}
                            />
                        </div>

                        {/* Details Section */}
                        <div className="flex flex-col justify-center">
                            <div className="space-y-4 mb-8">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{product.title}</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-baseline gap-3">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-red-500">$</span>
                                            <span className="text-5xl font-black text-white tracking-tight">{product.price}</span>
                                        </div>
                                        {product.oldPrice && (
                                            <span className="text-2xl font-bold text-gray-500 line-through opacity-50">
                                                ${product.oldPrice}
                                            </span>
                                        )}
                                    </div>
                                    {product.inStock ? (
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-sm uppercase tracking-wide">
                                            <Check size={14} />
                                            In Stock
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm uppercase tracking-wide">
                                            <span className="w-2 h-2 rounded-full bg-red-500" />
                                            Out of Stock
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none text-gray-400 mb-10">
                                <p className="text-lg leading-relaxed">
                                    {product.description || `Experience premium quality with the ${product.title}. Designed for excellence and reliability, 
                                this ${product.type.toLowerCase()} delivers outstanding performance and value. 
                                Instant delivery and 24/7 support included.`}
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 list-none pl-0">
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-500"><Zap size={18} /></div>
                                        Instant Delivery
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-500"><Shield size={18} /></div>
                                        Secure Payment
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-500"><Globe size={18} /></div>
                                        Global Access
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-500"><Check size={18} /></div>
                                        Verified Quality
                                    </li>
                                </ul>
                            </div>

                            <div className="border-t border-white/10 pt-8">
                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <ReviewsSection productId={product.id} productName={product.title} />
                </div>
            </div>
        </ProductClientWrapper>
    );
}
