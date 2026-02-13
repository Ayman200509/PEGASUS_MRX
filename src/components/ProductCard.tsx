import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductCardProps {
    title: string;
    price: string;
    inStock?: boolean;
    type?: string;
    imageColor?: string;
    product?: any;
    image?: string;
    oldPrice?: string;
}

export function ProductCard({ title, price, inStock = true, type = "Service", imageColor = "bg-[#101015]", product, image, oldPrice }: ProductCardProps) {
    const { addToCart } = useCart();
    const router = useRouter();

    // Construct a product object if one isn't passed fully (for public view compatibility)
    const productObj = product || {
        id: title.toLowerCase().replace(/\s+/g, '-'), // Better fallback than mock-id
        title,
        price,
        oldPrice: oldPrice || product?.oldPrice,
        type,
        image
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inStock) return;
        addToCart(productObj);
        router.push('/cart');
    };

    return (
        <div className="group relative glass-card rounded-[24px] p-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(239,68,68,0.15)] flex flex-col h-full w-full overflow-hidden">
            <Link href={`/product/${productObj.id}`} className="absolute inset-0 z-10" />

            {/* Decorative Gradient Border on Hover */}
            <div className="absolute inset-0 rounded-[24px] border border-red-500/0 group-hover:border-red-500/30 transition-colors duration-500 pointer-events-none z-20" />

            {/* Image / Thumbnail Area */}
            <div className={`w-full aspect-[4/3] rounded-2xl ${imageColor} mb-5 relative overflow-hidden flex items-center justify-center group-hover:shadow-lg transition-all duration-500`}>

                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <>
                        {/* Background Patterns */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                        <div className="absolute inset-0 bg-grid-white/[0.02]" />

                        {/* Dynamic content placeholder */}
                        <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500 flex flex-col items-center">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-600 tracking-tighter drop-shadow-sm select-none">
                                {title.charAt(0)}
                            </div>
                            <div className="mt-2 h-1 w-8 bg-red-600 rounded-full" />
                        </div>
                    </>
                )}

                {/* Service Badge */}
                <div className="absolute top-3 left-3 z-30">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 shadow-lg tracking-wide uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        {type}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 px-1 mt-auto relative z-20">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors tracking-tight leading-tight">{title}</h3>
                </div>

                {inStock ? (
                    <div className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-[11px] text-emerald-500 font-bold tracking-wide uppercase opacity-80">Available</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span className="text-[11px] text-red-500 font-bold tracking-wide uppercase opacity-80">Out of Stock</span>
                    </div>
                )}

                <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">PRICE</p>
                        <div className="flex items-baseline gap-1.5">
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-sm font-bold text-red-500">$</span>
                                <span className="text-2xl font-black text-white tracking-tight">{price}</span>
                            </div>
                            {(oldPrice || productObj.oldPrice) && (
                                <span className="text-sm font-bold text-gray-500 line-through opacity-50">
                                    ${oldPrice || productObj.oldPrice}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className={`relative z-30 overflow-hidden pl-5 pr-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 group/btn flex items-center gap-2 ${inStock ? "bg-white text-black hover:bg-red-600 hover:text-white" : "bg-white/5 text-gray-500 cursor-not-allowed"}`}
                    >
                        <span className="relative z-10">{inStock ? "Add to Cart" : "Sold Out"}</span>
                        {inStock && <ShoppingCart size={14} className="relative z-10 transform group-hover/btn:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
