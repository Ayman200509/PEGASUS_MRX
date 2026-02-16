import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { resetData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session || session.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        // Verify structure roughly
        const hasData = zipEntries.some(entry => entry.entryName.includes('src/data.json') || entry.entryName.includes('data.json'));

        if (!hasData) {
            return NextResponse.json({ error: 'Invalid backup: missing data.json' }, { status: 400 });
        }

        // 1. Restore Data
        // Extract data.json directly to src/data.json
        // We find the data entry
        const dataEntry = zipEntries.find(entry => entry.entryName.endsWith('data.json'));
        if (dataEntry) {
            const dataContent = zip.readAsText(dataEntry);
            const dataPath = path.join(process.cwd(), 'src/data.json');
            fs.writeFileSync(dataPath, dataContent, 'utf-8');

            // Also update the base restore point so "Reset" works correctly after import
            const baseDataPath = path.join(process.cwd(), 'src/data.base.json');
            // We strip orders/visits for the base restore point
            try {
                const data = JSON.parse(dataContent);
                data.orders = [];
                data.visits = [];
                data.reviews = [];
                data.tickets = [];
                fs.writeFileSync(baseDataPath, JSON.stringify(data, null, 2), 'utf-8');
            } catch (e) {
                console.error("Failed to update restore point:", e);
            }
        }

        // 2. Restore Media
        const publicUploads = path.join(process.cwd(), 'public/uploads');
        // Ensure directory exists
        if (!fs.existsSync(publicUploads)) {
            fs.mkdirSync(publicUploads, { recursive: true });
        }

        // Extract files that are in public/uploads folder in zip
        zipEntries.forEach(entry => {
            if (entry.entryName.startsWith('public/uploads/') && !entry.isDirectory) {
                const fileName = path.basename(entry.entryName);
                if (fileName) {
                    zip.extractEntryTo(entry, publicUploads, false, true);
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Backup Import Error:', error);
        return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
    }
}
