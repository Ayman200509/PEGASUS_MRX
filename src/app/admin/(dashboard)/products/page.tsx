"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/db";
import { ProductList } from "@/components/admin/products/ProductList";
import { ProductWizard } from "@/components/admin/products/ProductWizard";

export default function ProductsPage() {
    const [view, setView] = useState<"list" | "wizard">("list");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        setLoading(true);
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch products:", err);
                setProducts([]);
                setLoading(false);
            });
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setView("wizard");
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setView("wizard");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        fetchProducts();
    };

    const handleWizardCancel = () => {
        setView("list");
        setEditingProduct(null);
    };

    const handleWizardSuccess = () => {
        setView("list");
        setEditingProduct(null);
        fetchProducts();
    };

    return (
        <div className="min-h-screen">
            {view === "list" ? (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Products</h1>
                        <p className="text-gray-400">Manage your digital products, services, and accounts.</p>
                    </div>

                    <ProductList
                        products={products}
                        loading={loading}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            ) : (
                <div className="max-w-5xl mx-auto py-8">
                    <ProductWizard
                        initialData={editingProduct}
                        onCancel={handleWizardCancel}
                        onSuccess={handleWizardSuccess}
                    />
                </div>
            )}
        </div>
    );
}
