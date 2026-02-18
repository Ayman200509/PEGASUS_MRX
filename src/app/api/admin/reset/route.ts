import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resetData } from '@/lib/db';
import fs from 'fs/promises';
import * as fsSync from 'fs';
import path from 'path';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session || session.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Reset Database
        await resetData();

        // 2. Clear Media Library
        try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            console.log(`[Admin Reset] Attempting to clear uploads directory: ${uploadsDir}`);

            // Delete entire directory and re-create it for a clean slate
            if (fsSync.existsSync(uploadsDir)) {
                const filesBefore = await fs.readdir(uploadsDir);
                // Using recursive delete to handle subdirectories if any
                await fs.rm(uploadsDir, { recursive: true, force: true });
                console.log(`[Admin Reset] Deleted uploads directory containing ${filesBefore.length} items.`);
            }

            // Re-create the empty directory
            await fs.mkdir(uploadsDir, { recursive: true });
            console.log(`[Admin Reset] Re-created empty uploads directory.`);

        } catch (mediaError) {
            console.error('[Admin Reset] Failed to clear media library:', mediaError);
            // Continue even if media clear fails, to at least reset DB
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
    }
}
