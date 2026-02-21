import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';


// Generates a URL-safe slug from a product title
// e.g. "VIP Channel!" → "vip-channel"
const slugify = (title: string) =>
    title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
        .replace(/\s+/g, '-')            // spaces → dashes
        .replace(/-+/g, '-');            // collapse multiple dashes

export async function GET() {
    try {
        const data = await getData();
        const products = data.products || [];

        // Sort by position (ascending)
        products.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));

        return NextResponse.json(products);
    } catch (error) {
        console.error("Products API GET Error:", error);
        return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        // Build a slug from title, ensure uniqueness
        const baseSlug = slugify(body.title) || Math.random().toString(36).substring(2, 9);
        const existingIds = new Set((data.products || []).map((p: any) => p.id));
        let slug = baseSlug;
        let counter = 2;
        while (existingIds.has(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }

        const newProduct = {
            id: slug,
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
            customFields: body.customFields || [],
            position: body.position || 0,
            ctaButton: body.ctaButton || { label: "", url: "", visible: false },
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

        // Handle bulk update (array of product updates)
        if (Array.isArray(body)) {
            const updates = body;
            let updatedCount = 0;

            updates.forEach(update => {
                if (update.id === undefined) return;
                const index = (data.products || []).findIndex((p: any) => p.id === update.id);
                if (index !== -1) {
                    data.products[index] = { ...data.products[index], ...update };
                    updatedCount++;
                }
            });

            await saveData(data);
            return NextResponse.json({ success: true, updatedCount });
        }

        // Handle single product update (existing logic)
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
