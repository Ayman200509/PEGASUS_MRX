const http = require('http');

// Simulate the payload exactly as the frontend would send it now
const data = JSON.stringify({
    customerEmail: 'bhnayman@gmail.com',
    customerTelegram: '@test_telegram_id', // This is what we expect the frontend to send now
    items: [
        {
            title: 'Test Product with Telegram',
            price: 15,
            quantity: 1,
            id: 'test-item-telegram',
            customValues: { "Telegram ID": "@test_telegram_id" }
        }
    ],
    total: 15
});

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/orders',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        try {
            const json = JSON.parse(chunk);
            if (json.customerTelegram === '@test_telegram_id') {
                console.log("SUCCESS: Telegram ID verified in response!");
            } else {
                console.log("FAILURE: Telegram ID mismatch or missing.");
            }
        } catch (e) {
            console.log("Could not parse response JSON");
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
