import { NextResponse } from 'next/server';
import { getData, saveData, Visit } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { path } = body;

        // Get IP from headers (mocked for now as localhost usually doesn't show much)
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

        const data = await getData();

        const newVisit: Visit = {
            id: Math.random().toString(36).substring(7),
            path: path,
            date: new Date().toISOString(),
            ip: ip
        };

        // Initialize visits if it doesn't exist (safety)
        if (!data.visits) data.visits = [];

        // SAFETY CHECK: If data appears to be default/empty (no products/orders),
        // it means getData() likely failed and returned defaults.
        // DO NOT SAVE in this case, to prevent overwriting the real database with empty data.
        if (data.products.length === 0 && data.orders.length === 0) {
            console.warn("Analytics: Database appears empty/corrupted. Skipping visit save to prevent overwrite.");
            return NextResponse.json({ skipped: true });
        }

        data.visits.push(newVisit);
        await saveData(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Failed to track visit" }, { status: 500 });
    }
}
