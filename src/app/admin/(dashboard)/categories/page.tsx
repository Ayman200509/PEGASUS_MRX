"use client";

import { useEffect, useState } from "react";
import { Plus, FolderOpen, Trash2, Search, Loader2 } from "lucide-react";
import { Category } from "@/lib/db";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.warn("Categories API did not return an array:", data);
                setCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                body: JSON.stringify({ name: newCategoryName }),
                headers: { 'Content-Type': 'application/json' }
            });
            const newCategory = await res.json();
            setCategories([...categories, newCategory]);
            setNewCategoryName("");
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to add category", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete category", error);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Categories...</div>;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Categories</h1>
                    <p className="text-gray-400 text-sm">Organize your products into categories</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                    <Plus size={20} /> Add Category
                </button>
            </div>

            {/* Empty State */}
            {categories.length === 0 ? (
                <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                        <FolderOpen size={40} className="text-gray-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No categories yet</h2>
                    <p className="text-gray-400 mb-8 max-w-sm">Create categories to organize your products and make them easier to find.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all"
                    >
                        <Plus size={20} /> Create First Category
                    </button>
                </div>
            ) : (
                <>
                    {/* Search */}
                    <div className="mb-6 relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                        />
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCategories.map((category) => (
                            <div key={category.id} className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                        <FolderOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-red-500 transition-colors">{category.name}</h3>
                                        <p className="text-xs text-gray-500">{category.count} Products</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Category Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card p-8 rounded-3xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-black text-white mb-6">Add New Category</h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Category Name</label>
                                <input
                                    autoFocus
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                    placeholder="e.g. Accounts"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newCategoryName.trim() || isSubmitting}
                                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
