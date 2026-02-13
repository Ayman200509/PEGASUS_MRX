import { NextResponse } from 'next/server';
import { getData } from '@/lib/db';

export async function GET() {
    try {
        const data = await getData();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Finance API GET Error:", error);
        return NextResponse.json({ error: "Failed to load finance data" }, { status: 500 });
    }
}
