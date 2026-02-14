import { useState, useEffect } from "react";
import { Loader2, Plus, X, Image as ImageIcon, Video, Check } from "lucide-react";
// Actually, let's build a self-contained modal to avoid dependency issues if Shadcn isn't fully set up or to keep it simple.

interface MediaFile {
    name: string;
    url: string;
    type: "image" | "video";
}

interface MediaPickerProps {
    onSelect: (url: string) => void;
    type?: "image" | "video" | "both"; // Filter
    trigger?: React.ReactNode;
}

export function MediaPicker({ onSelect, type = "both", trigger }: MediaPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/media");
            if (res.ok) {
                const data = await res.json();
                setFiles(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();
                // Refresh and auto-select if needed, or just refresh
                await fetchFiles();
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const filteredFiles = files.filter(f => type === "both" || f.type === type);

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                {trigger || <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-colors">Select Media</button>}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Media Library</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-red-600" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {/* Upload Card */}
                                    <label className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 hover:bg-white/10 transition-all group">
                                        <div className="bg-white/5 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                            {uploading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : <Plus size={24} className="text-gray-400 group-hover:text-red-500" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Upload New</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept={type === 'video' ? "video/*" : type === 'image' ? "image/*" : "image/*,video/*"}
                                            onChange={handleUpload}
                                            disabled={uploading}
                                        />
                                    </label>

                                    {filteredFiles.map((file) => (
                                        <div
                                            key={file.name}
                                            onClick={() => {
                                                onSelect(file.url);
                                                setIsOpen(false);
                                            }}
                                            className="group relative aspect-square bg-black rounded-xl overflow-hidden border border-white/10 hover:border-red-500 cursor-pointer transition-all"
                                        >
                                            {file.type === 'image' ? (
                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={file.url} className="w-full h-full object-cover" />
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Select</span>
                                            </div>

                                            {/* Type Badge */}
                                            <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-md">
                                                {file.type === 'image' ? <ImageIcon size={12} className="text-gray-300" /> : <Video size={12} className="text-gray-300" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
