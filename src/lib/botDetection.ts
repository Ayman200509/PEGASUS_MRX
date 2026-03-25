import { NextResponse } from 'next/server';

const requestLog = new Map<string, number[]>();
const BOT_KEYWORDS = ['bot', 'crawl', 'spider', 'slurp', 'facebook', 'preview', 'python', 'curl'];

// Clean up old rate limit entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const windowStart = Date.now() - 10000;
    for (const [key, timestamps] of requestLog.entries()) {
        const valid = timestamps.filter(t => t > windowStart);
        if (valid.length === 0) {
            requestLog.delete(key);
        } else {
            requestLog.set(key, valid);
        }
    }
}, 5 * 60 * 1000);

export function withBotDetection(handler: (request: Request & { isBot?: boolean }) => Promise<Response | NextResponse>) {
    return async (request: Request) => {
        const userAgent = request.headers.get('user-agent') || '';
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const lowerUA = userAgent.toLowerCase();
        
        let isBot = false;
        
        // 1. User-Agent Check
        if (BOT_KEYWORDS.some(keyword => lowerUA.includes(keyword))) {
            isBot = true;
        }

        // 2. Rate limiting check
        if (!isBot) {
            const now = Date.now();
            const windowStart = now - 10 * 1000; // 10 seconds
            
            let timestamps = requestLog.get(ip) || [];
            timestamps = timestamps.filter(t => t > windowStart);
            
            if (timestamps.length >= 20) {
                isBot = true;
            }
            
            timestamps.push(now);
            requestLog.set(ip, timestamps);
        }

        // Set the flag
        (request as any).isBot = isBot;

        if (isBot) {
            console.log(`[Bot Detection] Blocked bot traffic. IP: ${ip}, UA: {${userAgent}}`);
        }

        return handler(request as Request & { isBot?: boolean });
    };
}
