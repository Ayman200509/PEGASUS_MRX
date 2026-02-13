"use client";

import { Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useEffect, useState } from "react";
import { Product } from "@/lib/db";

export function ProductSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch('/api/products')
            .then(res => {
                if (!res.ok) {
                    console.error("Products API error:", res.status);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data && data.error) {
                    console.error("API Error:", data.error);
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-6 pb-32">

            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-center justify-end mb-16 gap-8 border-b border-white/5 pb-8">
                {/* Modern Search Bar */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                        <Search className="h-4 w-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#0a0a0c] border border-white/10 text-gray-100 text-sm rounded-full focus:ring-2 focus:ring-red-500/20 focus:border-red-500 block w-full pl-12 pr-6 py-4 placeholder-gray-600 shadow-xl transition-all focus:bg-[#101015]"
                        placeholder="Search for tools..."
                    />
                    {/* Glow effect under search */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-20 blur transition duration-500 -z-10" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500 animate-pulse">Loading Products...</div>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            title={product.title}
                            price={product.price}
                            oldPrice={product.oldPrice}
                            type={product.type}
                            imageColor={product.imageColor}
                            image={product.image}
                            inStock={product.inStock}
                            product={product}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500 text-sm">No products found for "{searchQuery}".</p>
                    </div>
                )}
            </div>
        </div>
    );
}
