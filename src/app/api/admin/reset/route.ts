import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resetData } from '@/lib/db';
import fs from 'fs/promises';
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
            // Ensure directory exists
            await fs.mkdir(uploadsDir, { recursive: true });

            const files = await fs.readdir(uploadsDir);
            for (const file of files) {
                // Skip .gitkeep or system files if necessary, currently deleting all
                await fs.unlink(path.join(uploadsDir, file));
            }
            console.log(`[Admin Reset] Cleared ${files.length} files from uploads.`);
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
