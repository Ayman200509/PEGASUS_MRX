import nodemailer from 'nodemailer';
import { Order } from './db';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const SENDER_EMAIL = process.env.SMTP_FROM || 'twilioacc3@gmail.com';

export async function sendOrderEmail(order: Order, type: 'Pending' | 'Completed', payUrl?: string) {
    const isCompleted = type === 'Completed';
    const subject = isCompleted
        ? `Order Delivered - #${order.id.slice(0, 8)}`
        : `Action Required: Complete Your Order - #${order.id.slice(0, 8)}`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fff;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #ef4444; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1.5px;">PEGASUS <span style="color: #000;">MRX</span></h1>
                <p style="color: #666; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Premium Digital Products</p>
            </div>
            
            <div style="background-color: ${isCompleted ? '#f0fdf4' : '#fff1f2'}; border: 1px solid ${isCompleted ? '#bbf7d0' : '#fecdd3'}; padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
                <h2 style="color: ${isCompleted ? '#166534' : '#be123c'}; margin: 0; font-size: 20px; font-weight: 800;">
                    ${isCompleted ? '✓ Order Delivered!' : 'Order Received - Pending Payment'}
                </h2>
                <p style="color: ${isCompleted ? '#166534' : '#be123c'}; font-size: 15px; margin: 8px 0 0 0; line-height: 1.5;">
                    ${isCompleted
            ? 'Your order has been successfully processed and delivered. Below are your purchase details.'
            : 'Your order is currently on hold. Please complete the payment using the link below to receive your products instantly.'}
                </p>
                ${!isCompleted && payUrl ? `
                    <div style="margin-top: 20px;">
                        <a href="${payUrl}" style="background-color: #ef4444; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
                            Complete Payment Now
                        </a>
                    </div>
                ` : ''}
            </div>

            <div style="margin-bottom: 25px; background-color: #f9fafb; padding: 20px; border-radius: 12px;">
                <h3 style="font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Order Summary</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <p style="font-size: 14px; margin: 0; color: #374151;"><strong>Order ID:</strong> #${order.id}</p>
                    <p style="font-size: 14px; margin: 0; color: #374151;"><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                    <p style="font-size: 14px; margin: 0; color: #374151;"><strong>Status:</strong> <span style="color: ${isCompleted ? '#10b981' : '#f59e0b'}; font-weight: bold;">${order.status}</span></p>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h3 style="font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Purchased Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left; font-size: 11px; color: #9ca3af; text-transform: uppercase;">
                            <th style="padding: 10px 0;">Product</th>
                            <th style="padding: 10px 0; text-align: center;">Qty</th>
                            <th style="padding: 10px 0; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr style="border-bottom: 1px solid #f3f4f6;">
                                <td style="padding: 12px 0; font-size: 14px; font-weight: bold; color: #111827;">
                                    ${item.title}
                                    ${item.customValues ? `
                                        <div style="margin-top: 6px; font-size: 12px; color: #6b7280; font-weight: normal; background-color: #f9fafb; padding: 8px; border-radius: 6px;">
                                            ${Object.entries(item.customValues).map(([key, value]) => `
                                                <div style="margin-bottom: 2px;">
                                                    <span style="font-weight: 600; color: #4b5563; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">${key}:</span> 
                                                    <span style="color: #111827;">${value}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </td>
                                <td style="padding: 12px 0; font-size: 14px; text-align: center; color: #4b5563; vertical-align: top;">${item.quantity}</td>
                                <td style="padding: 12px 0; font-size: 14px; text-align: right; color: #111827; font-weight: bold; vertical-align: top;">$${item.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 20px 0 10px 0; text-align: right; font-size: 14px; color: #6b7280; font-weight: bold;">Total Amount</td>
                            <td style="padding: 20px 0 10px 0; text-align: right; font-weight: 900; color: #ef4444; font-size: 24px; letter-spacing: -1px;">$${order.total}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 25px;">
                <p style="margin: 0; font-weight: bold;">© ${new Date().getFullYear()} PEGASUS MRX</p>
                <p style="margin: 5px 0;">This is an automated message, please do not reply.</p>
                <div style="margin-top: 15px;">
                    <a href="https://t.me/PEGASUS_MRX" style="color: #ef4444; text-decoration: none; font-weight: bold;">Contact Support on Telegram</a>
                </div>
            </div>
        </div>
    `;

    try {
        // Send to Customer
        await transporter.sendMail({
            from: `"Pegasus MRX" <${SENDER_EMAIL}>`,
            to: order.customerEmail,
            subject: subject,
            html: html,
        });
        console.log(`Email sent to customer for order ${order.id} (${type})`);

        // Send to Admin (Only for Completed/Confirmed orders)
        if (isCompleted) {
            const adminHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #333; border-radius: 10px; background-color: #000; color: #fff;">
                    <h2 style="color: #ef4444; border-bottom: 1px solid #333; padding-bottom: 10px;">New Order Confirmed!</h2>
                    
                    <div style="margin-top: 20px;">
                        <h3 style="color: #9ca3af; font-size: 14px; text-transform: uppercase;">Customer Details</h3>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
                        <p style="margin: 5px 0;"><strong>Telegram:</strong> ${order.customerTelegram || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>IP Address:</strong> ${order.ip || 'Unknown'} (${order.country || 'Unknown'})</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <h3 style="color: #9ca3af; font-size: 14px; text-transform: uppercase;">Order Details</h3>
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order.id}</p>
                        <p style="margin: 5px 0;"><strong>Total:</strong> $${order.total}</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; color: #fff;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 1px solid #333;">
                                    <th style="padding: 8px 0;">Item</th>
                                    <th style="padding: 8px 0;">Qty</th>
                                    <th style="padding: 8px 0;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr style="border-bottom: 1px solid #111;">
                                        <td style="padding: 10px 0;">
                                            ${item.title}
                                            ${item.customValues ? `
                                                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
                                                    ${Object.entries(item.customValues).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                                </div>
                                            ` : ''}
                                        </td>
                                        <td style="padding: 10px 0;">${item.quantity}</td>
                                        <td style="padding: 10px 0;">$${item.price}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            await transporter.sendMail({
                from: `"Pegasus Admin Bot" <${SENDER_EMAIL}>`,
                to: "Pegasusmrx@aol.com",
                subject: `💰 NEW ORDER: #${order.id} - $${order.total}`,
                html: adminHtml,
            });
            console.log(`Admin notification sent for order ${order.id}`);
        }

    } catch (error) {
        console.error("Failed to send email:", error);
    }
}
