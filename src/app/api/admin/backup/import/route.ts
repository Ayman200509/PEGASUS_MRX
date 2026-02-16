import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import unzipper from 'unzipper';
import path from 'path';
import fs from 'fs';

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

        // Open zip from buffer
        const directory = await unzipper.Open.buffer(buffer);

        // Verify structure
        const hasData = directory.files.some(file => file.path.includes('src/data.json') || file.path.includes('data.json'));

        if (!hasData) {
            return NextResponse.json({ error: 'Invalid backup: missing data.json' }, { status: 400 });
        }

        // 1. Restore Data
        const dataEntry = directory.files.find(file => file.path.endsWith('data.json'));
        if (dataEntry) {
            const dataContent = await dataEntry.buffer();
            const dataPath = path.join(process.cwd(), 'src/data.json');
            fs.writeFileSync(dataPath, dataContent);

            // Also update the base restore point
            const baseDataPath = path.join(process.cwd(), 'src/data.base.json');
            try {
                const data = JSON.parse(dataContent.toString('utf-8'));
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
        if (!fs.existsSync(publicUploads)) {
            fs.mkdirSync(publicUploads, { recursive: true });
        }

        // Extract files in public/uploads in parallel
        const mediaFiles = directory.files.filter(file => file.path.startsWith('public/uploads/') && file.type === 'File');

        await Promise.all(mediaFiles.map(async (file) => {
            const fileName = path.basename(file.path);
            if (fileName) {
                const content = await file.buffer();
                const filePath = path.join(publicUploads, fileName);
                fs.writeFileSync(filePath, content);
            }
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Backup Import Error:', error);
        return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
    }
}
