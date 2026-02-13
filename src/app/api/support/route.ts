import { NextResponse } from 'next/server';
import { getData, saveData, SupportTicket } from '@/lib/db';

const generateId = () => Math.random().toString(36).substring(2, 9);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const data = await getData();

        if (id) {
            const ticket = data.tickets?.find(t => t.id === id);
            if (!ticket) {
                return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
            }
            return NextResponse.json(ticket);
        }

        return NextResponse.json(data.tickets || []);
    } catch (error) {
        console.error("Support API GET Error:", error);
        return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        if (!data.tickets) {
            data.tickets = [];
        }

        const newTicket: SupportTicket = {
            id: `TCK-${generateId().toUpperCase()}`,
            user: body.name || "Guest",
            email: body.email,
            subject: body.subject,
            message: body.message,
            status: "pending",
            priority: "medium",
            date: new Date().toLocaleDateString(),
            messages: [
                {
                    sender: "user",
                    text: body.message,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]
        };

        data.tickets.unshift(newTicket);
        await saveData(data);

        return NextResponse.json(newTicket);
    } catch (error) {
        console.error("Support API POST Error:", error);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const data = await getData();

        if (!data.tickets) return NextResponse.json({ error: "No tickets found" }, { status: 404 });

        const index = data.tickets.findIndex(t => t.id === body.id);
        if (index === -1) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

        // Update fields if provided
        if (body.status) data.tickets[index].status = body.status;
        if (body.priority) data.tickets[index].priority = body.priority;

        // Add reply if provided
        if (body.reply) {
            const sender = body.sender || "admin";

            data.tickets[index].messages.push({
                sender: sender,
                text: body.reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            // Auto update status logic
            if (sender === 'admin') {
                if (data.tickets[index].status === 'open') data.tickets[index].status = 'pending';
            } else if (sender === 'user') {
                data.tickets[index].status = 'open';
            }
        }

        await saveData(data);
        return NextResponse.json(data.tickets[index]);
    } catch (error) {
        console.error("Support API PUT Error:", error);
        return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Ticket ID required" }, { status: 400 });

        const data = await getData();
        if (!data.tickets) return NextResponse.json({ error: "No tickets found" }, { status: 404 });

        const initialLength = data.tickets.length;
        data.tickets = data.tickets.filter(t => t.id !== id);

        if (data.tickets.length === initialLength) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        await saveData(data);
        return NextResponse.json({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.error("Support API DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
    }
}
