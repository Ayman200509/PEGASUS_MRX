"use client";

import { useState, useEffect } from "react";
import { StarRating } from "./StarRating";
import { Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

import { useSearchParams } from "next/navigation";

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

interface ReviewsSectionProps {
    productId: string;
    productName: string;
}

export function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
    const searchParams = useSearchParams();
    const showReviewForm = searchParams.get('review') === 'true';

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form inputs
    const [userName, setUserName] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMsg("");

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, userName, rating, comment })
            });
            const data = await res.json();

            if (res.ok) {
                setReviews([data, ...reviews]);
                setUserName("");
                setComment("");
                setRating(5);
                setSuccessMsg("Review submitted successfully!");
            } else {
                alert("Failed to submit review.");
            }
        } catch (error) {
            alert("Error submitting review.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-20 pt-10 border-t border-white/10">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-2">
                Customer Reviews <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* List Reviews */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-500" /></div>
                    ) : reviews.length === 0 ? (
                        <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold text-white">
                                            {review.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{review.userName}</p>
                                            <div className="text-xs text-gray-500">
                                                {(() => {
                                                    try {
                                                        return formatDistanceToNow(new Date(review.date), { addSuffix: true });
                                                    } catch (e) {
                                                        return "Review";
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-gray-300 mt-2 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Write Review Form */}
                {showReviewForm ? (
                    <div className="bg-[#121215] p-8 rounded-3xl border border-white/5 h-fit sticky top-24 animate-in slide-in-from-right-4">
                        <h3 className="text-xl font-bold text-white mb-6">Write a Review</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Your Name</label>
                                <input
                                    required
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 placeholder-gray-700"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Rating</label>
                                <div className="bg-black/50 border border-white/10 rounded-xl py-3 px-4 flex items-center gap-2">
                                    <StarRating rating={rating} editable onRate={setRating} size={24} />
                                    <span className="text-gray-500 text-sm ml-2 font-bold">{rating}/5</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Review</label>
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 placeholder-gray-700 h-32 resize-none"
                                    placeholder="Share your experience..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Submit Review</>}
                            </button>

                            {successMsg && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-center text-sm font-bold animate-in fade-in slide-in-from-bottom-2">
                                    {successMsg}
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="bg-[#121215] p-8 rounded-3xl border border-white/5 h-fit sticky top-24 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Send className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">Verified Reviews Only</h3>
                        <p className="text-sm text-gray-600">You can leave a review after purchasing this product. Check your order confirmation page.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
