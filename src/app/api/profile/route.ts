import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

export async function GET() {
    try {
        const data = await getData();

        // Dynamically calculate stats for reviews (Sales/Products are now manually managed or incremented on order)
        const reviewsCount = data.reviews ? data.reviews.length : 0;

        // Return profile with extra stats
        return NextResponse.json({ ...data.profile, reviewsCount });
    } catch (error) {
        console.error("Profile API GET Error:", error);
        return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        data.profile = { ...data.profile, ...body };
        await saveData(data);

        return NextResponse.json(data.profile);
    } catch (error) {
        console.error("Profile API PUT Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
