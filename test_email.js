require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: '"Pegasus MRX Test" <twilioacc3@gmail.com>',
            to: 'twilioacc3@gmail.com', // Sending to self for test
            subject: 'SMTP Test - Pegasus MRX',
            text: 'This is a test email to verify Brevo SMTP configuration.',
            html: '<b>This is a test email to verify Brevo SMTP configuration.</b>',
        });
        console.log("Email sent successfully:", info.messageId);
    } catch (e) {
        console.error("Email sending failed:", e);
    }
}

testEmail();
