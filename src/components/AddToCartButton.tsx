"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/db";

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const router = useRouter();

    const handleAddToCart = () => {
        addToCart(product);
        router.push('/cart');
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full md:w-auto min-w-[200px] bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-3 ${!product.inStock && 'opacity-50 cursor-not-allowed'}`}
        >
            <ShoppingCart size={20} />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
    );
}
