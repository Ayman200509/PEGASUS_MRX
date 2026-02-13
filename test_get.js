
async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/orders');
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(`Orders count: ${data.length}`);
        console.log(`IDs: ${data.map(o => o.id).join(', ')}`);
    } catch (e) {
        console.error(e);
    }
}

test();
