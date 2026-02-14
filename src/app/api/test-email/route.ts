import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to');

    if (!to) {
        return NextResponse.json({ error: 'Missing "to" query parameter' }, { status: 400 });
    }

    console.log("Diagnostic: Configuring transporter...");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
    console.log("From:", process.env.SMTP_FROM);

    // Create a transporter similar to the main app but with debug enabled
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true,
        logger: true
    });

    try {
        console.log("Diagnostic: Verifying transporter...");
        await transporter.verify();
        console.log("Diagnostic: Transporter verified.");

        console.log("Diagnostic: Sending email...");
        const info = await transporter.sendMail({
            from: `"Pegasus Diagnostic" <${process.env.SMTP_FROM || 'admin@pegasus1337.store'}>`,
            to: to,
            subject: 'Pegasus MRX Diagnostic Email',
            text: 'If you received this, the Next.js app can send emails.',
            html: '<b>If you received this, the Next.js app can send emails.</b>',
        });

        console.log("Diagnostic: Email sent:", info.messageId);
        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
        console.error("Diagnostic: Email failed:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            env: {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER,
                from: process.env.SMTP_FROM
            }
        }, { status: 500 });
    }
}
