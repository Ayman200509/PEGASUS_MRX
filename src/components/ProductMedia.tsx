"use client";

import { useState, useEffect } from "react";
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
    // State to track what is currently being shown (Main Image, Gallery Image, or Video)
    // Structure: { type: 'image' | 'video', src: string }
    const [activeMedia, setActiveMedia] = useState({ type: 'image', src: mainImage });

    useEffect(() => {
        const handleFullscreenChange = async () => {
            // Entered fullscreen - try to lock to landscape
            if (document.fullscreenElement) {
                if (screen.orientation && 'lock' in screen.orientation) {
                    try {
                        // Use 'any' cast because TS might not know about lock method on some versions
                        await (screen.orientation as any).lock('landscape');
                    } catch (e) {
                        console.log('Orientation lock failed (requires HTTPS/Secure Context)');
                    }
                }
            } else {
                // Exited fullscreen - unlock
                if (screen.orientation && 'unlock' in screen.orientation) {
                    try {
                        (screen.orientation as any).unlock();
                    } catch (e) {
                        console.log('Unlock failed');
                    }
                }
            }
        };

        // Add event listeners
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        const container = document.getElementById('video-wrapper');
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Display Area */}
            <div className={`w-full aspect-square rounded-3xl ${imageColor || 'bg-[#121215]'} relative overflow-hidden flex items-center justify-center border border-white/5`}>

                {activeMedia.type === 'image' ? (
                    activeMedia.src ? (
                        <img src={activeMedia.src} alt={title} className="w-full h-full object-cover animate-in fade-in duration-300" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-9xl font-black text-white/5 select-none">{title.charAt(0)}</span>
                        </div>
                    )
                ) : (
                    // Video Player Container
                    <div
                        id="video-wrapper"
                        className="w-full h-full flex items-center justify-center bg-black"
                        onClick={toggleFullscreen}
                    >
                        <video
                            id="product-video"
                            src={activeMedia.src}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                            loop
                            controlsList="nodownload noplaybackrate"
                            disablePictureInPicture
                            onContextMenu={(e) => e.preventDefault()}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent double triggering if container also has click
                                toggleFullscreen();
                            }}
                        />
                    </div>
                )}

                {/* Badger (Only show on image) */}
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
                            className={`aspect-square rounded-2xl overflow-hidden border bg-[#121215] cursor-pointer transition-all ${activeMedia.src === mainImage ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5 hover:border-red-500/50'}`}
                        >
                            <img src={mainImage} alt="Main" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Gallery Images */}
                    {images.map((img, i) => img && (
                        <div
                            key={`img-${i}`}
                            onClick={() => setActiveMedia({ type: 'image', src: img })}
                            className={`aspect-square rounded-2xl overflow-hidden border bg-[#121215] cursor-pointer transition-all ${activeMedia.src === img ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5 hover:border-red-500/50'}`}
                        >
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                        </div>
                    ))}

                    {/* Videos */}
                    {videos.map((vid, i) => vid && (
                        <div
                            key={`vid-${i}`}
                            onClick={() => setActiveMedia({ type: 'video', src: vid })}
                            className={`aspect-square rounded-2xl overflow-hidden border bg-[#121215] cursor-pointer transition-all flex items-center justify-center relative ${activeMedia.src === vid ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5 hover:border-red-500/50'}`}
                        >
                            {/* Video Thumbnail (Placeholder or generated) */}
                            <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center shadow-xl z-10">
                                <Play size={20} fill="currentColor" />
                            </div>
                            <video src={vid} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            <p className="absolute bottom-2 text-[8px] font-bold text-gray-500 uppercase tracking-widest z-10">Video</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
