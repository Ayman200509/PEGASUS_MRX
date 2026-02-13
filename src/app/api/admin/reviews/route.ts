import { NextResponse } from 'next/server';
import { getData, saveData, Review } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// DELETE a review
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
        const data = await getData();

        const initialLength = data.reviews?.length || 0;
        data.reviews = (data.reviews || []).filter(r => r.id !== id);

        if (data.reviews.length === initialLength) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        await saveData(data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
}

// POST - Add a "Fake" Review as Admin
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, userName, rating, comment, date } = body; // Admin can specify date

        if (!productId || !userName || !rating) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const data = await getData();
        // Validate product exists
        const product = data.products.find(p => p.id === productId);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const newReview: Review = {
            id: uuidv4(),
            productId,
            productName: product.title,
            userName,
            rating: Number(rating),
            comment: comment || "",
            date: date || new Date().toISOString() // Use provided date or now
        };

        if (!data.reviews) data.reviews = [];
        data.reviews.push(newReview);
        await saveData(data);

        return NextResponse.json(newReview);
    } catch (error) {
        console.error("Admin Review Add Error:", error);
        return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
    }
}
