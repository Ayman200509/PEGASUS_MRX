import { Loader2, Plus, X, Trash2 } from "lucide-react";
import { useState } from "react";

interface StepDetailsProps {
    title: string;
    setTitle: (v: string) => void;
    price: string;
    setPrice: (v: string) => void;
    oldPrice: string;
    setOldPrice: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
    stock: string;
    setStock: (v: string) => void;
    inStock: boolean;
    setInStock: (v: boolean) => void;
    image: string;
    setImage: (v: string) => void;
    images: string[];
    setImages: (v: string[]) => void;
    videos: string[];
    setVideos: (v: string[]) => void;
}

export function StepDetails({
    title, setTitle,
    price, setPrice,
    oldPrice, setOldPrice,
    description, setDescription,
    stock, setStock,
    inStock, setInStock,
    image, setImage,
    images, setImages,
    videos, setVideos
}: StepDetailsProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'gallery' | 'video', index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. File Size Check (10MB Limit)
        if (file.size > 10 * 1024 * 1024) {
            alert("File is too large. Please upload less than 10MB.");
            return;
        }

        setIsUploading(true);

        // 2. Optimistic UI (Instant Preview)
        const objectUrl = URL.createObjectURL(file);
        if (type === 'image') {
            setImage(objectUrl);
        } else if (type === 'gallery') {
            setImages([...images, objectUrl]);
        } else if (type === 'video') {
            setVideos([...videos, objectUrl]);
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Use the unified upload route
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                // 3. Update with Real URL
                if (data.url) {
                    if (type === 'image') {
                        setImage(data.url);
                    } else if (type === 'gallery') {
                        // Replace the last added optimistic URL with real one
                        // Note: This simple logic assumes user doesn't upload multiple fast. 
                        // For a robust app, we'd map by ID, but for this simpler admin, it's fine.
                        // Actually, let's just replace the exact objectUrl if possible, 
                        // or better, just re-set state. 
                        // Given the concurrency, sticking to appending the real one might duplicate if we just append.
                        // The optimistic one is already in state. We need to REPLACE it.

                        setImages((prev) => prev.map(u => u === objectUrl ? data.url : u));
                    } else if (type === 'video') {
                        setVideos((prev) => prev.map(u => u === objectUrl ? data.url : u));
                    }
                }
            } else {
                alert("Upload failed. Server rejected file.");
                // Revert optimistic update on failure
                if (type === 'image') setImage("");
                else if (type === 'gallery') setImages((prev) => prev.filter(u => u !== objectUrl));
                else if (type === 'video') setVideos((prev) => prev.filter(u => u !== objectUrl));
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Product Details</h3>
                <p className="text-gray-400">Basic information about your product.</p>
            </div>

            {/* Image Upload */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0a0a0c]">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Product Images</label>

                <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-32 h-32 shrink-0">
                        {image ? (
                            <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 relative group">
                                <img src={image} alt="Thumbnail" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setImage("")}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <label className={`w-full h-full rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                                <div className="bg-white/5 p-3 rounded-full mb-2">
                                    {isUploading ? <Loader2 size={20} className="animate-spin text-gray-400" /> : <Plus size={20} className="text-gray-400" />}
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Thumbnail</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploading} />
                            </label>
                        )}
                    </div>

                    {/* Gallery */}
                    <div className="flex-1 grid grid-cols-4 gap-2">
                        {images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative group">
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <label className={`aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                            <Plus size={16} className="text-gray-500" />
                            <span className="text-[9px] text-gray-500 font-bold uppercase mt-1">Add</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'gallery')} disabled={isUploading} />
                        </label>
                    </div>
                </div>

                {/* Videos Section */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2 block">Product Videos (Upload or URL)</label>
                    <div className="space-y-2 mb-2">
                        {videos.map((vid, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-[#121215] p-2 rounded-xl border border-white/10">
                                <div className="flex-1 overflow-hidden">
                                    {/* Try to display video, fallback to link if it fails or purely for edit */}
                                    <video src={vid} className="h-12 w-auto rounded object-cover" controls playsInline />
                                </div>
                                <input
                                    value={vid}
                                    onChange={(e) => {
                                        const newVideos = [...videos];
                                        newVideos[idx] = e.target.value;
                                        setVideos(newVideos);
                                    }}
                                    className="w-1/2 bg-transparent text-[10px] text-gray-500 border-none focus:ring-0"
                                    placeholder="https://..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <label className={`flex-1 flex flex-col items-center justify-center py-3 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                <span>Upload Video</span>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="video/*"
                                onChange={(e) => handleFileUpload(e, 'video')}
                                disabled={isUploading}
                            />
                        </label>

                        <button
                            type="button"
                            onClick={() => setVideos([...videos, ""])}
                            className="flex-1 py-3 border border-dashed border-white/10 rounded-xl text-xs font-bold uppercase text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Add URL
                        </button>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Product Name <span className="text-red-500">*</span></label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700"
                        placeholder="e.g. Premium Ebook"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Price ($) <span className="text-red-500">*</span></label>
                        <div className="flex bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden">
                            <button className="px-3 text-gray-500 hover:bg-white/5 border-r border-white/10">-</button>
                            <input
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-transparent border-none py-3 px-4 text-white text-center focus:ring-0"
                                placeholder="0.00"
                            />
                            <button className="px-3 text-gray-500 hover:bg-white/5 border-l border-white/10">+</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Old Price (Optional)</label>
                        <div className="flex bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden">
                            <button className="px-3 text-gray-500 hover:bg-white/5 border-r border-white/10">-</button>
                            <input
                                value={oldPrice}
                                onChange={(e) => setOldPrice(e.target.value)}
                                className="w-full bg-transparent border-none py-3 px-4 text-white text-center focus:ring-0"
                                placeholder="0.00"
                            />
                            <button className="px-3 text-gray-500 hover:bg-white/5 border-l border-white/10">+</button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1 pl-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Stock Quantity</label>
                        <span className="text-xs text-gray-600">Leave empty for unlimited</span>
                    </div>
                    <div className="flex bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden">
                        <button className="px-3 text-gray-500 hover:bg-white/5 border-r border-white/10">-</button>
                        <input
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full bg-transparent border-none py-3 px-4 text-white text-center focus:ring-0 placeholder-gray-700"
                            placeholder="Unlimited"
                        />
                        <button className="px-3 text-gray-500 hover:bg-white/5 border-l border-white/10">+</button>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-1 pl-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                        <span className="text-xs text-gray-600">Supports markdown</span>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 h-40 resize-none font-mono text-sm"
                        placeholder="Describe your product..."
                    />
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#0a0a0c] rounded-xl border border-white/5">
                    <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="w-5 h-5 rounded border-white/10 bg-black text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                        <label className="text-sm font-bold text-white block">Available for Purchase</label>
                        <p className="text-xs text-gray-500">Uncheck to hide this product from the store.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
