import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, email, orderId } = body;

        const response = await fetch('https://api.oxapay.com/merchants/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchant: "KMH9IZ-S6RP63-FDGSIV-GKR7IO", // Provided API Key
                amount: amount,
                currency: "USD",
                lifeTime: 30, // 30 minutes to pay
                feePaidByPayer: 0,
                underPaidCoverage: 0,
                callbackUrl: `${new URL(request.url).origin}/api/checkout/callback`,
                returnUrl: `${new URL(request.url).origin}/cart?status=success`, // Redirect to cart with success msg or similar
                description: `Order #${orderId}`,
                orderId: orderId,
                email: email
            }),
        });

        const data = await response.json();

        if (data.result === 100 && data.payLink) {
            // Save trackId to order
            try {
                // We need to import getData and saveData inside the function to avoid circular dependencies if any, 
                // but standard import is fine. 
                // Note: The file currently only imports NextResponse. Checking imports...
                const { getData, saveData } = await import('@/lib/db');
                const dbData = await getData();
                const orderIndex = dbData.orders.findIndex((o: any) => o.id === orderId);

                if (orderIndex !== -1) {
                    dbData.orders[orderIndex].trackId = data.trackId;
                    await saveData(dbData);
                }
            } catch (saveError) {
                console.error("Failed to save trackId:", saveError);
                // Continue returning the link even if saving trackId fails, but log it.
            }

            return NextResponse.json({ payLink: data.payLink });
        } else {
            console.error("Oxapay Error:", data);
            return NextResponse.json({ error: data.message || "Payment generation failed" }, { status: 500 });
        }

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
