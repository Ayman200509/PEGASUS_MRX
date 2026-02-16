import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

// Force node runtime for filesystem access
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session || session.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const filename = `backup-pegasus-${new Date().toISOString().split('T')[0]}.zip`;

        // Create a PassThrough stream to pipe the archive to
        const { Readable, Writable } = await import('stream');

        // Next.js App Router Response with streaming
        // We need to create a ReadableStream from the Node stream
        const stream = new ReadableStream({
            start(controller) {
                const archive = archiver('zip', {
                    zlib: { level: 1 } // Level 1: Fastest compression
                });

                // Listen for errors
                archive.on('error', (err) => {
                    controller.error(err);
                });

                // When the archive finishes, close the controller
                archive.on('end', () => {
                    controller.close();
                });

                // Data events from archive are murky in a web stream context without a bridge
                // So we use a standard trick: pipe archive to a PassThrough, and read from PassThrough
                // faster: wrap `archive` directly if it supports it, but archiver is a meaningful Writable/Readable

                // Better approach for Next.js:
                // archive.pipe(...) -> we need a Writable that feeds the controller.
                // Or use a library like `stream-to-web-readable`? 
                // Let's implement a simple adapter.

                archive.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });

                // 1. Add Data Files
                const dataPath = path.join(process.cwd(), 'src/data.json');
                if (fs.existsSync(dataPath)) {
                    archive.file(dataPath, { name: 'src/data.json' });
                } else {
                    // If main data missing, try default
                    const defaultPath = path.join(process.cwd(), 'src/lib/data.default.json');
                    if (fs.existsSync(defaultPath)) {
                        archive.file(defaultPath, { name: 'src/data.json' });
                    }
                }

                // 2. Add Media Files
                const uploadsPath = path.join(process.cwd(), 'public/uploads');
                if (fs.existsSync(uploadsPath)) {
                    archive.directory(uploadsPath, 'public/uploads');
                }

                archive.finalize();
            }
        });

        return new NextResponse(stream, {
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
