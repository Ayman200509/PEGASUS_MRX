import { NextResponse } from 'next/server';
import { getData, saveData, Order } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderEmail } from '@/lib/email';
import { createPayment } from '@/lib/oxapay';

export async function GET() {
    try {
        const data = await getData();
        // Return orders or empty array if undefined
        return NextResponse.json(data.orders || []);
    } catch (error) {
        console.error("Orders API GET Error:", error);
        return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        // Initialize orders if it doesn't exist
        if (!data.orders) {
            data.orders = [];
        }

        // Capture IP and Country
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
        const country = request.headers.get("x-vercel-ip-country") ||
            request.headers.get("cf-ipcountry") ||
            "Unknown";

        const newOrder: Order = {
            id: body.id || uuidv4(),
            customerEmail: body.customerEmail,
            customerTelegram: body.customerTelegram,
            items: body.items,
            total: body.total,
            status: body.status || "Pending Payment",
            date: new Date().toISOString(),
            ip,
            country
        };

        // Add order to list
        data.orders.unshift(newOrder); // Add to top

        await saveData(data);

        // Generate Payment Link
        const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
        console.log(`[Order API] Creating payment with Origin: ${origin}`);
        console.log(`[Order API] NEXT_PUBLIC_APP_URL value: ${process.env.NEXT_PUBLIC_APP_URL}`);

        const { payLink, error: payError } = await createPayment(newOrder.total, newOrder.customerEmail, newOrder.id, origin);

        // Send Pending Email with Payment Link
        console.log(`[Order API] Attempting to send Pending email to ${newOrder.customerEmail} for order ${newOrder.id}`);
        try {
            await sendOrderEmail(newOrder, 'Pending', payLink);
            console.log(`[Order API] Pending email sent successfully`);
        } catch (emailError) {
            console.error(`[Order API] Failed to send Pending email:`, emailError);
        }

        return NextResponse.json({ ...newOrder, payLink });
    } catch (error) {
        console.error("Orders API POST Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
