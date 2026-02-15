import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cwd = process.cwd();
        const dataPath = path.join(cwd, 'src/data.json');

        let fileStatus = "Filesystem check:\n";
        fileStatus += `CWD: ${cwd}\n`;
        fileStatus += `Data Path: ${dataPath}\n`;

        const exists = fs.existsSync(dataPath);
        fileStatus += `Exists: ${exists}\n`;

        if (exists) {
            const content = fs.readFileSync(dataPath, 'utf-8');
            const data = JSON.parse(content);
            fileStatus += `Reviews Count in File: ${data.reviews ? data.reviews.length : 0}\n`;
            fileStatus += `Reviews: ${JSON.stringify(data.reviews, null, 2)}\n`;
        } else {
            // Check if it's in a different location (e.g. standalone structure)
            const fallbackPath = path.join(cwd, 'data.json'); // maybe in root?
            fileStatus += `Checking fallback ${fallbackPath}: ${fs.existsSync(fallbackPath)}\n`;
        }

        return new NextResponse(fileStatus, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
