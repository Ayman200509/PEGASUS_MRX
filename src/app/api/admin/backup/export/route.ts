import { NextResponse, NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

// Force node runtime for filesystem access
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const headerStore = await headers();
        const host = headerStore.get('host') || 'pegasus1337.store';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
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
                let dataJsonPath = dataPath;
                if (!fs.existsSync(dataPath)) {
                    dataJsonPath = path.join(process.cwd(), 'src/lib/data.default.json');
                }

                if (fs.existsSync(dataJsonPath)) {
                    archive.file(dataJsonPath, { name: 'src/data.json' });

                    // 1.1 Add Video URLs as a text file
                    try {
                        const dataContent = fs.readFileSync(dataJsonPath, 'utf-8');
                        const data = JSON.parse(dataContent);
                        const videoPaths: string[] = [];

                        if (Array.isArray(data.products)) {
                            data.products.forEach((p: any) => {
                                if (Array.isArray(p.videos)) {
                                    p.videos.forEach((v: string) => {
                                        if (v) videoPaths.push(v);
                                    });
                                }
                            });
                        }

                        const uniqueVideos = Array.from(new Set(videoPaths));
                        if (uniqueVideos.length > 0) {
                            const videoLinksText = uniqueVideos
                                .map(v => v.startsWith('http') ? v : `${baseUrl}${v}`)
                                .join('\n');
                            archive.append(videoLinksText, { name: 'video_links.txt' });
                        }
                    } catch (e) {
                        console.error("Failed to extract video links:", e);
                    }
                }

                // 2. Add Media Files (excluding videos)
                const uploadsPath = path.join(process.cwd(), 'public/uploads');
                if (fs.existsSync(uploadsPath)) {
                    archive.glob('**/*', {
                        cwd: uploadsPath,
                        ignore: ['*.mp4', '*.mov', '*.avi', '*.webm', '*.MOV', '*.MP4', '*.WEBM']
                    }, { prefix: 'public/uploads' });
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
