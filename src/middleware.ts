import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the user is accessing an admin route
    if (request.nextUrl.pathname.startsWith('/pegapega')) {
        const session = request.cookies.get('admin_session');

        // Allow access to login page
        if (request.nextUrl.pathname === '/pegapega/login') {
            const adminSession = request.cookies.get('admin_session');
            if (session?.value === 'true') {
                return NextResponse.redirect(new URL('/pegapega', request.url));
            }
            return NextResponse.next();
        }

        // Protect other admin routes
        if (!session || session.value !== 'true') {
            return NextResponse.redirect(new URL('/pegapega/login', request.url));
        }  // If no session, redirect to login
        if (!session) {
            return NextResponse.redirect(new URL('/pegapega/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/pegapega/:path*']
};
