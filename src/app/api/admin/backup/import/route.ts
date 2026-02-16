import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import unzipper from 'unzipper';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session || session.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Stream-to-Disk Approach
        // Instead of buffering in memory with arrayBuffer(), we pipe the request body directly to disk.
        // This allows infinite file size (constrained only by disk space).

        const tmpPath = path.join(process.cwd(), 'temp_restore.zip');

        if (!req.body) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Convert Web Stream to Node Stream and pipe to file
        // @ts-ignore
        const { Readable } = await import('stream');
        // @ts-ignore
        const nodeStream = Readable.fromWeb(req.body);
        const fileStream = fs.createWriteStream(tmpPath);

        await new Promise((resolve, reject) => {
            nodeStream.pipe(fileStream);
            nodeStream.on('error', reject);
            fileStream.on('finish', () => resolve(null));
            fileStream.on('error', reject);
        });

        // Hybrid Approach: Try native unzip first (faster for large files), fallback to node-unzipper
        // tmpPath is already defined above

        try {
            // File is already at tmpPath, no need to write buffer

            // Try native unzip
            // -o: overwrite without prompting
            // -d: destination directory
            // We unzip directly to process.cwd() because the zip structure contains 'public/uploads' and 'src/data.json'
            await execAsync(`unzip -o "${tmpPath}" -d "${process.cwd()}"`);

            // Verify data.json exists after unzip
            const dataPath = path.join(process.cwd(), 'src/data.json');
            if (fs.existsSync(dataPath)) {
                // Update restore point
                const dataContent = fs.readFileSync(dataPath, 'utf-8');
                const baseDataPath = path.join(process.cwd(), 'src/data.base.json');
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
            } else {
                throw new Error("Native unzip failed to extract data.json");
            }

        } catch (nativeError) {
            console.warn("Native unzip failed, falling back to node-unzipper:", nativeError);

            // Fallback: Node-based Unzip (Slower but reliable)
            const directory = await unzipper.Open.file(tmpPath);

            // Verify structure
            const hasData = directory.files.some(file => file.path.includes('src/data.json') || file.path.includes('data.json'));

            if (!hasData) {
                // Cleanup temp file
                if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
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
        }

        // Cleanup temp file
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Backup Import Error:', error);
        return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
    }
}
