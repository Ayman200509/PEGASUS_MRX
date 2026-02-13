import { NextResponse } from 'next/server';
import { getData } from '@/lib/db';

export async function GET() {
    try {
        const data = await getData();

        // Filter visits for today
        const now = new Date();
        const todayVisits = (data.visits || []).filter(visit => {
            const visitDate = new Date(visit.date);
            return visitDate.getDate() === now.getDate() &&
                visitDate.getMonth() === now.getMonth() &&
                visitDate.getFullYear() === now.getFullYear();
        });

        return NextResponse.json({
            count: todayVisits.length,
            live: true
        });
    } catch (error) {
        console.error("Live Analytics API GET Error:", error);
        return NextResponse.json({ count: 0, live: false, error: "Failed to load live stats" }, { status: 500 });
    }
}
