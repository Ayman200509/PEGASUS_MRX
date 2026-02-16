import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resetData } from '@/lib/db';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session || session.value !== 'true') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await resetData();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 });
    }
}
