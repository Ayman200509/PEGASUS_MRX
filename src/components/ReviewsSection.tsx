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
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

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


    return (
        <div className="mt-20 pt-10 border-t border-white/10">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-2">
                Customer Reviews <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
            </h2>

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
        </div>
    );
}
