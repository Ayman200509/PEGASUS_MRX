import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';
import { sendOrderEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, status } = body;

        if (!orderId) {
            return NextResponse.json({ error: "No orderId provided" }, { status: 400 });
        }

        const data = await getData();
        const orderIndex = data.orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            console.error(`Order ${orderId} not found for callback`);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // OxaPay statuses: Paid, Canceled, Expired, Underpaid, etc.
        // We map them to our system statuses
        let newStatus = data.orders[orderIndex].status;

        if (status === 'Paid') {
            newStatus = "Completed";
            data.profile.salesCount += 1;
        } else if (status === 'Canceled' || status === 'Expired') {
            newStatus = "Canceled";
        }

        console.log(`Updating order ${orderId} status from ${data.orders[orderIndex].status} to ${newStatus} (OxaPay: ${status})`);

        data.orders[orderIndex].status = newStatus;
        await saveData(data);

        // Send Confirmation Email if Paid
        if (status === 'Paid') {
            console.log(`[Callback API] Attempting to send Completed email to ${data.orders[orderIndex].customerEmail} for order ${orderId}`);
            try {
                await sendOrderEmail(data.orders[orderIndex], 'Completed');
                console.log(`[Callback API] Completed email sent successfully`);
            } catch (emailError) {
                console.error(`[Callback API] Failed to send Completed email:`, emailError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Callback processing error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
