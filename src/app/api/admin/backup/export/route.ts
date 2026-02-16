import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

// Force node runtime for filesystem access
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session || session.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const zip = new AdmZip();

        // 1. Add Data Files
        const dataPath = path.join(process.cwd(), 'src/data.json');
        if (fs.existsSync(dataPath)) {
            zip.addLocalFile(dataPath, "src");
        } else {
            // If main data missing, try default
            const defaultPath = path.join(process.cwd(), 'src/lib/data.default.json');
            if (fs.existsSync(defaultPath)) {
                zip.addLocalFile(defaultPath, "src", "data.json");
            }
        }

        // 2. Add Media Files
        const uploadsPath = path.join(process.cwd(), 'public/uploads');
        if (fs.existsSync(uploadsPath)) {
            zip.addLocalFolder(uploadsPath, "public/uploads");
        }

        const buffer = zip.toBuffer();
        const filename = `backup-pegasus-${new Date().toISOString().split('T')[0]}.zip`;

        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Backup Export Error:', error);
        return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
    }
}
