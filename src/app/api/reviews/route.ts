import { NextResponse } from 'next/server';
import { getData, saveData, Review } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    try {
        const data = await getData();
        let reviews = data.reviews || [];

        if (productId) {
            reviews = reviews.filter(r => r.productId === productId);
        }

        // Sort by newest first
        reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, userName, rating, comment } = body;

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
            date: new Date().toISOString()
        };

        if (!data.reviews) data.reviews = [];
        data.reviews.push(newReview);

        await saveData(data);

        return NextResponse.json(newReview);

    } catch (error) {
        console.error("Review Submit Error:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}
