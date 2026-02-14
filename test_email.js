require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("Configuring transporter...");
    console.log("Host:", process.env.SMTP_HOST);
    console.log("Port:", process.env.SMTP_PORT);
    console.log("User:", process.env.SMTP_USER);
    console.log("From:", process.env.SMTP_FROM);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true, // show debug output
        logger: true // log information in console
    });

    try {
        console.log("Verifying transporter connection...");
        await transporter.verify();
        console.log("Transporter connection verified!");

        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: `"Pegasus MRX Test" <${process.env.SMTP_FROM || 'admin@pegasus1337.store'}>`,
            to: 'twilioacc3@gmail.com',
            subject: 'SMTP Test - Pegasus MRX (Updated)',
            text: 'This is a test email to verify Brevo SMTP configuration.',
            html: '<b>This is a test email to verify Brevo SMTP configuration.</b>',
        });
        console.log("Email sent successfully:", info.messageId);
    } catch (e) {
        console.error("Email sending failed:", e);
    }
}

testEmail();
