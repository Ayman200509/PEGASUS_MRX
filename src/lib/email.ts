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
    // debug: true,
    // logger: true
});

const SENDER_EMAIL = process.env.SMTP_FROM || 'admin@pegasus1337.store';

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
            text: isCompleted
                ? `Order Delivered! Your order #${order.id} has been successfully processed. Total: $${order.total}`
                : `Order Received. Please complete your payment for order #${order.id}. Total: $${order.total}`,
            html: html,
        });
        console.log(`Email sent to customer for order ${order.id} (${type})`);

        // Send to Admin (Only for Completed/Confirmed orders)
        if (isCompleted) {
            const adminHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #d32f2f; margin-top: 0; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">New Order Notification</h2>
                        
                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
                            <strong style="color: #0d47a1;">STATUS:</strong> ${order.status.toUpperCase()}<br>
                            <strong style="color: #0d47a1;">TOTAL:</strong> $${order.total}
                        </div>

                        <h3 style="color: #333; margin-bottom: 10px;">Customer Information</h3>
                        <ul style="list-style: none; padding: 0; margin-bottom: 20px; background-color: #fafafa; padding: 15px; border-radius: 4px;">
                            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${order.customerEmail}</li>
                            <li style="margin-bottom: 8px;"><strong>Telegram:</strong> ${order.customerTelegram || 'N/A'}</li>
                            <li style="margin-bottom: 8px;"><strong>Location:</strong> ${order.country || 'Unknown'} (IP: ${order.ip || 'Unknown'})</li>
                            <li><strong>Order ID:</strong> ${order.id}</li>
                        </ul>

                        <h3 style="color: #333; margin-bottom: 10px;">Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse; background-color: #fff;">
                            <thead>
                                <tr style="background-color: #eee;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                            <div style="font-weight: bold;">${item.title}</div>
                                            ${item.customValues ? `
                                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                                    ${Object.entries(item.customValues).map(([key, value]) => `<span style="background-color: #f5f5f5; padding: 2px 5px; border-radius: 3px;">${key}: ${value}</span>`).join(' ')}
                                                </div>
                                            ` : ''}
                                        </td>
                                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">$${item.price}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                             <tfoot>
                                <tr>
                                    <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">GRAND TOTAL</td>
                                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #d32f2f; font-size: 18px;">$${order.total}</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
                            System Notification • ${new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
            `;

            await transporter.sendMail({
                from: `"System Admin" <${SENDER_EMAIL}>`,
                to: "pegasus.jerseyllc@gmail.com",
                subject: `💰 SALE: $${order.total} - ${order.customerEmail}`,
                html: adminHtml,
            });
            console.log(`Admin detailed notification sent for order ${order.id}`);
        }

    } catch (error) {
        console.error("Failed to send email:", error);
    }
}
