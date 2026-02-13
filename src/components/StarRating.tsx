"use client";

import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: number;
    editable?: boolean;
    onRate?: (rating: number) => void;
}

export function StarRating({ rating, max = 5, size = 16, editable = false, onRate }: StarRatingProps) {
    return (
        <div className="flex gap-1" onMouseLeave={() => editable && onRate?.(rating)}>
            {/* Simple implementation, hover effects can be added complexly but keeping it simple */}
            {Array.from({ length: max }).map((_, i) => {
                const filled = i < rating;
                return (
                    <button
                        key={i}
                        type="button"
                        onClick={() => editable && onRate?.(i + 1)}
                        className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
                        disabled={!editable}
                    >
                        <Star
                            size={size}
                            className={`${filled ? "text-yellow-500 fill-yellow-500" : "text-gray-600"} transition-colors`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
