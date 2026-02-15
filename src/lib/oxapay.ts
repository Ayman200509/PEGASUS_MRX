export async function createPayment(amount: string, email: string, orderId: string, origin: string) {
    try {
        const response = await fetch('https://api.oxapay.com/merchants/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchant: "KMH9IZ-S6RP63-FDGSIV-GKR7IO",
                amount: amount,
                currency: "USD",
                lifeTime: 30,
                feePaidByPayer: 0,
                underPaidCoverage: 0,
                callbackUrl: `${origin}/api/checkout/callback`,
                returnUrl: `${origin}/order/success?orderId=${orderId}`,
                description: `Order #${orderId}`,
                orderId: orderId,
                email: email
            }),
        });

        const data = await response.json();

        if (data.result === 100 && data.payLink) {
            return { payLink: data.payLink, trackId: data.trackId };
        } else {
            console.error("Oxapay Error:", data);
            return { error: data.message || "Payment generation failed" };
        }
    } catch (error) {
        console.error("Payment Utility Error:", error);
        return { error: "Internal Server Error" };
    }
}
