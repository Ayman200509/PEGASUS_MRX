"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface ProductMediaProps {
    mainImage: string;
    title: string;
    imageColor?: string;
    images?: string[];
    videos?: string[];
    type: string;
}

export function ProductMedia({ mainImage, title, imageColor, images = [], videos = [], type }: ProductMediaProps) {
    const [activeMedia, setActiveMedia] = useState({ type: 'image', src: mainImage });

    return (
        <div className="space-y-6">
            {/* Main Display Area */}
            <div className={`w-full relative overflow-hidden flex items-center justify-center rounded-3xl ${imageColor || 'bg-[#121215]'} border border-white/5`}>

                {activeMedia.type === 'image' ? (
                    activeMedia.src ? (
                        <img
                            src={activeMedia.src}
                            alt={title}
                            className="w-full h-auto max-h-[70vh] object-contain animate-in fade-in duration-300"
                        />
                    ) : (
                        <div className="flex flex-col items-center py-20">
                            <span className="text-9xl font-black text-white/5 select-none">{title.charAt(0)}</span>
                        </div>
                    )
                ) : (
                    // Video Player — iOS-safe: no autoPlay, no controlsList, no disablePictureInPicture, no requestFullscreen
                    <div
                        id="video-wrapper"
                        className="w-full aspect-video flex items-center justify-center bg-black"
                    >
                        <video
                            key={activeMedia.src}
                            src={activeMedia.src}
                            className="w-full h-full object-contain"
                            controls
                            muted
                            playsInline
                            loop
                            preload="metadata"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </div>
                )}

                {/* Badge (Only show on image) */}
                {activeMedia.type === 'image' && (
                    <div className="absolute top-6 left-6 pointer-events-none">
                        <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/10 shadow-lg tracking-wide uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {type}
                        </span>
                    </div>
                )}
            </div>

            {/* Gallery Grid */}
            {(images.length > 0 || videos.length > 0) && (
                <div className="grid grid-cols-4 gap-4">
                    {/* Main Image Thumbnail */}
                    {mainImage && (
                        <div
                            onClick={() => setActiveMedia({ type: 'image', src: mainImage })}
                            className={`aspect-square rounded-2xl overflow-hidden border bg-[#121215] cursor-pointer transition-all ${activeMedia.src === mainImage && activeMedia.type === 'image' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5 hover:border-red-500/50'}`}
                        >
                            <img src={mainImage} alt="Main" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Gallery Images */}
                    {images.map((img, i) => img && (
                        <div
                            key={`img-${i}`}
                            onClick={() => setActiveMedia({ type: 'image', src: img })}
                            className={`aspect-square rounded-2xl overflow-hidden border bg-[#121215] cursor-pointer transition-all ${activeMedia.src === img && activeMedia.type === 'image' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5 hover:border-red-500/50'}`}
                        >
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                        </div>
                    ))}

                    {/* Video Thumbnails */}
                    {videos.map((vid, i) => vid && (
                        <div
                            key={`vid-${i}`}
                            onClick={() => setActiveMedia({ type: 'video', src: vid })}
                            className={`aspect-square rounded-2xl overflow-hidden border bg-[#121215] cursor-pointer transition-all flex items-center justify-center relative ${activeMedia.src === vid && activeMedia.type === 'video' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5 hover:border-red-500/50'}`}
                        >
                            {/* #t=0.001 forces iOS Safari to load the first frame as a thumbnail */}
                            <video
                                src={`${vid}#t=0.001`}
                                className="absolute inset-0 w-full h-full object-cover opacity-50"
                                playsInline
                                muted
                                preload="metadata"
                            />
                            <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center shadow-xl z-10">
                                <Play size={20} fill="currentColor" />
                            </div>
                            <p className="absolute bottom-2 text-[8px] font-bold text-gray-500 uppercase tracking-widest z-10">Video</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
