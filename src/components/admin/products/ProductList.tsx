import { useState } from "react";
import { Edit2, Trash2, Plus, Search, Package, MoreHorizontal, Loader2 } from "lucide-react";
import { Product } from "@/lib/db";

interface ProductListProps {
    products: Product[];
    loading: boolean;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
}

export function ProductList({ products, loading, onEdit, onDelete, onCreate }: ProductListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                    />
                </div>
                <button
                    onClick={onCreate}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> New Product
                </button>
            </div>

            {/* Products Table */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                                <th className="py-4 pl-6 font-bold">Product</th>
                                <th className="py-4 font-bold">Type</th>
                                <th className="py-4 font-bold">Price</th>
                                <th className="py-4 font-bold">Stock</th>
                                <th className="py-4 font-bold">Status</th>
                                <th className="py-4 font-bold text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" />Loading products...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                <Package size={32} className="text-gray-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
                                            <p className="text-gray-500 text-sm mb-6">Create your first product to start selling.</p>
                                            <button
                                                onClick={onCreate}
                                                className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                                            >
                                                <Plus size={16} /> Create Product
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-[#0a0a0c] border border-white/10 overflow-hidden flex items-center justify-center">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={20} className="text-gray-700" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{product.title}</div>
                                                <div className="text-[10px] text-gray-500">Edited just now</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="inline-block px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                                            {product.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 text-white font-mono font-bold">
                                        ${product.price}
                                    </td>
                                    <td className="py-4 text-gray-400 font-mono text-sm">
                                        {product.inStock ? "∞" : "0"}
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider ${product.inStock ? "text-green-500" : "text-red-500"}`}>
                                            {product.inStock ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="p-2 hover:bg-amber-500/10 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(product.id)}
                                                className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
