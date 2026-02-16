"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart, Send } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row gap-4">
            <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-3 ${!product.inStock && 'opacity-50 cursor-not-allowed'}`}
            >
                <ShoppingCart size={20} />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <a
                href="https://t.me/Pegasus_mrx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3"
            >
                <Send size={20} />
                Contact Us
            </a>
        </div>
    );
}
