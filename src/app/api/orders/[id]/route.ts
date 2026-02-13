import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await getData();

        if (!data.orders) {
            return NextResponse.json({ error: "No orders found" }, { status: 404 });
        }

        const index = data.orders.findIndex((order: any) => order.id === id);

        if (index === -1) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Remove order
        data.orders.splice(index, 1);

        await saveData(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Order Detail API DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
