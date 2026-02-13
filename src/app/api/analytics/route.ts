import { NextResponse } from 'next/server';
import { getData } from '@/lib/db';

export async function GET() {
    try {
        const data = await getData();
        return NextResponse.json(data.visits || []);
    } catch (error) {
        console.error("Analytics API GET Error:", error);
        return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }
}
