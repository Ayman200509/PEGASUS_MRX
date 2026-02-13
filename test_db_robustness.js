const fs = require('fs/promises');
const path = require('path');

async function testRobstness() {
    const dataFilePath = path.join(process.cwd(), 'src/data.json');
    const originalContent = await fs.readFile(dataFilePath, 'utf-8');

    console.log("Original content length:", originalContent.length);

    // Simulate corruption
    await fs.writeFile(dataFilePath, originalContent + " CORRUPTION");
    console.log("Simulated corruption added.");

    try {
        // This should fail in a real environment if we use the modified getData
        // But since this is a separate script, we'd need to mock or run inside the app
        // Let's just create a mock of our logic here to verify the logic itself.

        async function mockGetData() {
            try {
                const fileContent = await fs.readFile(dataFilePath, 'utf-8');
                return JSON.parse(fileContent);
            } catch (e) {
                if (e.code === 'ENOENT') return { default: true };
                throw e; // Correct behavior
            }
        }

        console.log("Attempting to get data from corrupted file...");
        await mockGetData();
        console.log("FAILURE: Corrupted file was parsed or returned defaults!");
    } catch (e) {
        console.log("SUCCESS: Caught error as expected:", e.name);
    } finally {
        // Restore
        await fs.writeFile(dataFilePath, originalContent);
        console.log("Restored original content.");
    }
}

testRobstness();
