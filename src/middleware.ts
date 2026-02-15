import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the user is accessing an admin route
    if (request.nextUrl.pathname.startsWith('/moughit')) {

        // Allow access to the login page itself, but redirect if already logged in
        if (request.nextUrl.pathname === '/moughit/login') {
            const adminSession = request.cookies.get('admin_session');
            if (adminSession) {
                return NextResponse.redirect(new URL('/moughit', request.url));
            }
            return NextResponse.next();
        }

        // Check for the admin session cookie
        const adminSession = request.cookies.get('admin_session');

        // If no session, redirect to login
        if (!adminSession) {
            return NextResponse.redirect(new URL('/moughit/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/moughit/:path*',
};
