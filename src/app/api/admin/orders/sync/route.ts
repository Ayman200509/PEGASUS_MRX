import { NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

export async function POST() {
    try {
        const data = await getData();
        const orders = data.orders;
        let updatedCount = 0;

        // Filter for orders that are pending and have a trackId
        const pendingOrders = orders.filter(o =>
            (o.status === 'Pending Payment' || o.status === 'Pending') && o.trackId
        );

        console.log(`Found ${pendingOrders.length} pending orders to sync.`);

        for (const order of pendingOrders) {
            try {
                // Call OxaPay Inquiry API
                const response = await fetch('https://api.oxapay.com/merchants/inquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        merchant: "KMH9IZ-S6RP63-FDGSIV-GKR7IO", // API Key
                        trackId: order.trackId
                    })
                });

                const resData = await response.json();

                if (resData.result === 100) {
                    const status = resData.status; // Paid, Expired, etc.
                    let newStatus = order.status;

                    if (status === 'Paid' || status === 'Complete') {
                        newStatus = 'Completed';
                        if (order.status !== 'Completed') {
                            data.profile.salesCount += 1;
                        }
                    } else if (status === 'Expired') {
                        newStatus = 'Canceled'; // Or 'Expired' if you added that status type
                    } else if (status === 'Canceled') {
                        newStatus = 'Canceled';
                    }

                    if (newStatus !== order.status) {
                        console.log(`Sync: Updating order ${order.id} from ${order.status} to ${newStatus}`);
                        order.status = newStatus;
                        updatedCount++;
                    }
                }
            } catch (err) {
                console.error(`Sync: Failed to check order ${order.id}`, err);
            }
        }

        if (updatedCount > 0) {
            await saveData(data);
        }

        return NextResponse.json({ success: true, updated: updatedCount });

    } catch (error) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: "Failed to sync orders" }, { status: 500 });
    }
}
