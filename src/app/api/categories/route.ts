import { NextResponse } from 'next/server';
import { getData, saveData, Category } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const data = await getData();
        return NextResponse.json(data.categories || []);
    } catch (error) {
        console.error("Categories API GET Error:", error);
        return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        // Initialize categories if not present
        if (!data.categories) {
            data.categories = [];
        }

        const newCategory: Category = {
            id: uuidv4(),
            name: body.name,
            slug: body.name.toLowerCase().replace(/ /g, '-'),
            count: 0
        };

        data.categories.push(newCategory);
        await saveData(data);

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error("Categories API POST Error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await getData();
        if (data.categories) {
            data.categories = data.categories.filter(c => c.id !== id);
            await saveData(data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Categories API DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
