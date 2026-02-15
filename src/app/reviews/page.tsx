import { getData } from '@/lib/db';
import { Navbar } from "@/components/Navbar";
import { Star, MessageSquare, User } from "lucide-react";
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
    const data = await getData();
    const reviews = data.reviews || [];

    // Sort reviews by date descending (newest first)
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-4">
                            <Star className="text-red-500 fill-red-500 w-10 h-10 md:w-12 md:h-12" />
                            Customer Feedbacks
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            See what our community is saying about our products and services.
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="text-5xl font-black text-white">{reviews.length}</div>
                        <div className="text-sm text-red-500 font-bold uppercase tracking-widest">Total Reviews</div>
                    </div>
                </div>

                {/* Reviews Grid */}
                {reviews.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl text-center">
                        <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No reviews yet</h3>
                        <p className="text-gray-500 mt-2">Be the first to leave a review after your purchase!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedReviews.map((review) => (
                            <div key={review.id} className="glass-panel p-6 rounded-2xl hover:border-red-500/30 transition-all group relative overflow-hidden">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-red-600/10" />

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a1a20] to-[#0a0a0a] border border-white/5 flex items-center justify-center">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{review.userName || 'Anonymous'}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={`${i < review.rating ? 'text-red-500 fill-red-500' : 'text-gray-700'} transition-colors`}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-4">
                                    &quot;{review.comment}&quot;
                                </p>

                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-mono">Product:</span>
                                    <Link
                                        href={`/product/${review.productId}`}
                                        className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                    >
                                        {review.productName}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
