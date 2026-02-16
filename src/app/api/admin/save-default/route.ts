import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { saveCurrentAsDefault } from '@/lib/db';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session || session.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await saveCurrentAsDefault();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save Default error:', error);
        return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
    }
}
