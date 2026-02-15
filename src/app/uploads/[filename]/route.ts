import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return new NextResponse("Invalid filename", { status: 400 });
    }

    // Try multiple paths to find the file (Resilience for Standalone/Dev modes)
    const possiblePaths = [
        path.join(process.cwd(), 'public/uploads', filename),             // 1. Standard (Dev / correct Symlink)
        path.join(process.cwd(), '.next/standalone/public/uploads', filename), // 2. Nested Standalone
        path.join(process.cwd(), '../public/uploads', filename),          // 3. Parent (if cwd is .next/standalone)
        path.join('/home/pegasus/htdocs/pegasus1337.store/public/uploads', filename) // 4. Absolute Fallback
    ];

    for (const filePath of possiblePaths) {
        try {
            const fileBuffer = await fs.readFile(filePath);

            // Determine content type
            const ext = path.extname(filename).toLowerCase();
            let contentType = 'application/octet-stream';

            if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.webp') contentType = 'image/webp';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.mp4') contentType = 'video/mp4';

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        } catch (e) {
            // Continue to next path if file not found using this method
        }
    }

    return new NextResponse("File not found", { status: 404 });
}
