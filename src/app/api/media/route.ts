import { NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// GET: List all files
export async function GET() {
    try {
        const files = await readdir(UPLOAD_DIR);

        const fileDetails = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(UPLOAD_DIR, file);
                const stats = await stat(filePath);
                return {
                    name: file,
                    url: `/uploads/${file}`,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    type: file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'video' // Simple type check
                };
            })
        );

        // Sort by newest first
        fileDetails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return NextResponse.json(fileDetails);
    } catch (error) {
        console.error('Error listing files:', error);
        return NextResponse.json({ error: 'Failed to list files', details: String(error) }, { status: 500 });
    }
}

// DELETE: Delete a file
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        const filePath = path.join(UPLOAD_DIR, filename);

        // Security check: ensure file is within upload dir
        if (!filePath.startsWith(UPLOAD_DIR)) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        await unlink(filePath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
