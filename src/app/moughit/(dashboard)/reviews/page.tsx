"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/StarRating";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface Review {
    id: string;
    productId: string;
    productName: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

interface Product {
    id: string;
    title: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Add Fake Review State
    const [isAdding, setIsAdding] = useState(false);
    const [newReview, setNewReview] = useState({
        productId: "",
        userName: "",
        rating: 5,
        comment: "",
        date: "" // Optional date override
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reviewsRes, productsRes] = await Promise.all([
                fetch('/api/reviews'), // We can reuse the public GET for now or make a specific admin one if needed
                fetch('/api/products')
            ]);

            const reviewsData = await reviewsRes.json();
            const productsData = await productsRes.json();

            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review?")) return;
        setIsDeleting(id);

        try {
            await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            alert("Failed to delete review");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleAddFakeReview = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReview)
            });

            if (res.ok) {
                const addedReview = await res.json();
                setReviews([addedReview, ...reviews]);
                setIsAdding(false);
                setNewReview({ productId: "", userName: "", rating: 5, comment: "", date: "" });
            } else {
                alert("Failed to add review");
            }
        } catch (error) {
            alert("Error adding review");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Reviews</h1>
                    <p className="text-gray-400">Manage customer feedback.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Add Fake Review
                </button>
            </div>

            {/* Add Review Form */}
            {isAdding && (
                <div className="glass-panel p-6 rounded-3xl mb-8 border border-red-500/20 animate-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-4">Add Manual Review</h3>
                    <form onSubmit={handleAddFakeReview} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Product</label>
                            <select
                                required
                                value={newReview.productId}
                                onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500"
                            >
                                <option value="">Select Product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Customer Name</label>
                            <input
                                required
                                value={newReview.userName}
                                onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500"
                                placeholder="e.g. Happy Customer"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Rating</label>
                            <div className="bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 flex items-center gap-2">
                                <StarRating rating={newReview.rating} editable onRate={(r) => setNewReview({ ...newReview, rating: r })} />
                                <span className="text-gray-500 text-sm ml-2">{newReview.rating}/5</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Date (Optional)</label>
                            <input
                                type="datetime-local"
                                value={newReview.date}
                                onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Comment</label>
                            <textarea
                                required
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 h-24 resize-none"
                                placeholder="Review content..."
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-xl">Save Review</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="glass-panel p-6 rounded-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                                <th className="pb-4 font-bold pl-4">Product</th>
                                <th className="pb-4 font-bold">User</th>
                                <th className="pb-4 font-bold">Rating</th>
                                <th className="pb-4 font-bold">Comment</th>
                                <th className="pb-4 font-bold">Date</th>
                                <th className="pb-4 font-bold text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No reviews found.</td></tr>
                            ) : reviews.map((review) => (
                                <tr key={review.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4 font-bold text-white">{review.productName}</td>
                                    <td className="py-4 text-gray-400">{review.userName}</td>
                                    <td className="py-4"><StarRating rating={review.rating} size={14} /></td>
                                    <td className="py-4 text-gray-400 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                                    <td className="py-4 text-gray-500 text-xs">{formatDistanceToNow(new Date(review.date), { addSuffix: true })}</td>
                                    <td className="py-4 text-right pr-4">
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            disabled={isDeleting === review.id}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            {isDeleting === review.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
