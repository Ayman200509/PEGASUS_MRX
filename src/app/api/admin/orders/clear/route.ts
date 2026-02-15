import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

export async function DELETE() {
    try {
        const data = await getData();

        // Clear orders array but keep the reference
        data.orders = [];

        await saveData(data);

        return NextResponse.json({ success: true, message: "All orders cleared" });
    } catch (error) {
        console.error("Clear All Orders API Error:", error);
        return NextResponse.json({ error: "Failed to clear orders" }, { status: 500 });
    }
}
