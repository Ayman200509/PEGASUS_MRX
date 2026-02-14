"use client";

import { X, CreditCard, Mail } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { items, cartTotal, clearCart } = useCart();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Store custom field values: { itemId: { fieldLabel: value } }
    const [customValues, setCustomValues] = useState<Record<string, Record<string, string>>>({});

    if (!isOpen) return null;

    // Consolidate custom fields from all items
    const uniqueFields = items.reduce((acc, item) => {
        item.customFields?.forEach(field => {
            if (!acc.find(f => f.label === field.label)) {
                acc.push(field);
            }
        });
        return acc;
    }, [] as { label: string; required: boolean; type: string }[]);

    // Handle change for a consolidated field -> update all items that have this field
    const handleGlobalCustomValueChange = (label: string, value: string) => {
        setCustomValues(prev => {
            const next = { ...prev };
            items.forEach(item => {
                const hasField = item.customFields?.some(f => f.label === label);
                if (hasField) {
                    if (!next[item.id]) next[item.id] = {};
                    next[item.id][label] = value;
                }
            });
            return next;
        });
    };

    // Helper to get current value for a field (from first matching item)
    const getFieldValue = (label: string) => {
        for (const item of items) {
            if (item.customFields?.some(f => f.label === label)) {
                return customValues[item.id]?.[label] || "";
            }
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const orderId = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const orderData = {
            id: orderId,
            customerEmail: email,
            customerTelegram: getFieldValue("Telegram ID") || getFieldValue("Telegram") || "",
            items: items.map(item => ({
                productId: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                customValues: customValues[item.id] || {}
            })),
            total: cartTotal.toFixed(2),
            status: "Pending Payment"
        };

        // ... rest of submit logic
        try {
            console.log("Submitting order...", orderData);
            // 1. Create Order and generate Payment Link in one go
            const res = await fetch('/api/orders', {
                method: 'POST',
                body: JSON.stringify(orderData),
                headers: { 'Content-Type': 'application/json' }
            });

            console.log("Order API Response Status:", res.status);
            const data = await res.json();
            console.log("Order API Response Data:", data);

            if (data.payLink) {
                clearCart();
                // 2. Redirect to Payment
                window.location.href = data.payLink;
            } else {
                console.error("No payLink returned", data);
                alert("Payment initialization failed. Please try again.");
                setIsSubmitting(false);
            }

        } catch (error) {
            console.error("Checkout failed", error);
            setIsSubmitting(false);
            alert("Something went wrong. Please check your connection.");
        }
    };

    if (submitted) {
        return null; // Should have redirected or handled otherwise
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel p-0 rounded-3xl max-w-md w-full relative overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">CHECKOUT</p>
                        <h2 className="text-xl font-bold text-white">Complete Order</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between mb-2 last:mb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-gray-600">{item.title.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white truncate max-w-[150px]">{item.title}</p>
                                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-white">${item.price}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm text-gray-400">Total Amount</span>
                        <span className="text-xl font-black text-white">${cartTotal.toFixed(2)}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Email Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information (Consolidated Custom Fields) */}
                        {uniqueFields.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-2">
                                    Additional Information
                                </div>
                                {uniqueFields.map((field, idx) => (
                                    <div key={idx}>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            required={field.required}
                                            type={field.type || "text"}
                                            value={getFieldValue(field.label)}
                                            onChange={(e) => handleGlobalCustomValueChange(field.label, e.target.value)}
                                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                                            placeholder={`Enter ${field.label}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Payment Method (Mock) */}
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-black font-bold">C</div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">Pay with Crypto</p>
                                    <p className="text-[10px] text-gray-400">Secured by Oxapay</p>
                                </div>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-red-500 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {isSubmitting ? "Processing..." : `Pay Now $${cartTotal.toFixed(2)}`}
                        </button>

                        <p className="text-[10px] text-center text-gray-600">
                            By clicking Pay, you agree to the Terms of Service.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
