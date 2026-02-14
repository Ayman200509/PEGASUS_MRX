import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

export async function POST() {
    try {
        const data = await getData();
        data.visits = []; // Reset visits
        await saveData(data);
        return NextResponse.json({ success: true, message: "Visitor analytics reset successfully" });
    } catch (error) {
        console.error("Failed to reset analytics:", error);
        return NextResponse.json({ error: "Failed to reset analytics" }, { status: 500 });
    }
}
