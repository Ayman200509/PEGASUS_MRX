import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Plus } from "lucide-react";
import { Product } from "@/lib/db";
import { StepType } from "./steps/StepType";
import { StepDetails } from "./steps/StepDetails";
import { StepContent } from "./steps/StepContent";

interface ProductWizardProps {
    initialData?: Product | null;
    onCancel: () => void;
    onSuccess: () => void;
}

export function ProductWizard({ initialData, onCancel, onSuccess }: ProductWizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [type, setType] = useState("Service");
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [oldPrice, setOldPrice] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState("");
    const [inStock, setInStock] = useState(true);
    const [image, setImage] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [videos, setVideos] = useState<string[]>([]);

    // Content State
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [content, setContent] = useState("");


    useEffect(() => {
        if (initialData) {
            setType(initialData.type || "Service");
            setTitle(initialData.title);
            setPrice(initialData.price);
            setOldPrice(initialData.oldPrice || "");
            setDescription(initialData.description || "");
            setInStock(initialData.inStock);
            setImage(initialData.image || "");
            setImages(initialData.images || []);
            setVideos(initialData.videos || []);
            setContent(initialData.content || "");
            setCustomFields(initialData.customFields || []);
        }
    }, [initialData]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const productData = {
            title, price, oldPrice, type, image, images, videos, inStock, description,
            content, customFields
        };

        try {
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData ? { id: initialData.id, ...productData } : productData;

            await fetch('/api/products', {
                method,
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
            onSuccess();
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stepper */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-1">
                    <ChevronLeft size={16} /> Back to Products
                </button>

                <div className="flex items-center gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex items-center gap-2 ${step === s ? "opacity-100" : "opacity-40"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? "bg-green-500 text-black" : "bg-white/10 text-white"
                                }`}>
                                {step > s ? <Check size={16} /> : s}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest hidden md:block">
                                {s === 1 ? "Type" : s === 2 ? "Details" : "Content"}
                            </span>
                            {s < 3 && <div className="w-12 h-[2px] bg-white/10 mx-2 hidden md:block" />}
                        </div>
                    ))}
                </div>

                <div className="w-24" /> {/* Spacer for centering */}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <StepType type={type} setType={setType} />
                )}
                {step === 2 && (
                    <StepDetails
                        title={title} setTitle={setTitle}
                        price={price} setPrice={setPrice}
                        oldPrice={oldPrice} setOldPrice={setOldPrice}
                        description={description} setDescription={setDescription}
                        stock={stock} setStock={setStock}
                        inStock={inStock} setInStock={setInStock}
                        image={image} setImage={setImage}
                        images={images} setImages={setImages}
                        videos={videos} setVideos={setVideos}
                    />
                )}
                {step === 3 && (
                    <StepContent
                        type={type}
                        customFields={customFields} setCustomFields={setCustomFields}
                        content={content} setContent={setContent}
                    />
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
                <button
                    onClick={step === 1 ? onCancel : prevStep}
                    className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center gap-2"
                >
                    <ChevronLeft size={18} /> {step === 1 ? "Cancel" : "Back"}
                </button>

                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center gap-2"
                    >
                        Next <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? "Creating..." : "Create Product"} <Plus size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
