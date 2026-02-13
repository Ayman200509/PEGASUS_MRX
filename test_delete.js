

async function test() {
    const id = '913f3e7b-6c0c-4940-9f3e-f4c0e386a43e';
    console.log(`Deleting order ${id}...`);
    try {
        const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
            method: 'DELETE'
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body: ${text}`);
    } catch (e) {
        console.error(e);
    }
}

test();
