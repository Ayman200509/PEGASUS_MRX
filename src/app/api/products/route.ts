import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';


// Helper for ID generation since we don't have nanoid installed yet, 
// using a simple random string for now or better to install it.
// I'll keep it simple without external deps for this step to ensure speed.
const generateId = () => Math.random().toString(36).substring(2, 9);

export async function GET() {
    try {
        const data = await getData();
        return NextResponse.json(data.products || []);
    } catch (error) {
        console.error("Products API GET Error:", error);
        return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        const newProduct = {
            id: generateId(),
            title: body.title,
            price: body.price,
            description: body.description || "",
            oldPrice: body.oldPrice,
            type: body.type || "Product",
            inStock: body.inStock !== undefined ? body.inStock : true,
            imageColor: body.imageColor || "bg-gradient-to-br from-gray-800 to-black",
            image: body.image || "",
            images: body.images || [],
            videos: body.videos || [],
            content: body.content || "",
            customFields: body.customFields || []
        };

        if (!data.products) data.products = [];
        data.products.push(newProduct);

        // Update product count in profile
        data.profile.productsCount = data.products.length;

        await saveData(data);

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error("Products API POST Error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const data = await getData();
        data.products = (data.products || []).filter(p => p.id !== id);

        // Update product count
        data.profile.productsCount = data.products.length;

        await saveData(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Products API DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        const index = (data.products || []).findIndex(p => p.id === body.id);
        if (index === -1) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        data.products[index] = { ...data.products[index], ...body };
        await saveData(data);

        return NextResponse.json(data.products[index]);
    } catch (error) {
        console.error("Products API PUT Error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
