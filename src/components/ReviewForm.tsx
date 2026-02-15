"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { Loader2, Send } from "lucide-react";

interface ReviewFormProps {
    productId: string;
    productName: string;
    onSuccess?: () => void;
}

export function ReviewForm({ productId, productName, onSuccess }: ReviewFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [userName, setUserName] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

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
                setUserName("");
                setComment("");
                setRating(5);
                setSuccessMsg("Review submitted successfully!");
                if (onSuccess) onSuccess();
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
        <div className="bg-[#121215] p-6 rounded-3xl border border-white/5 h-fit">
            <h3 className="text-xl font-bold text-white mb-6">Review {productName}</h3>

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
    );
}
