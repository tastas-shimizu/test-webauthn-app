import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserAuthenticators } from '@/lib/db';

export async function GET(req: NextRequest) {
    const username = req.nextUrl.searchParams.get('username');
    if (!username) {
        return NextResponse.json(
            { error: 'ユーザー名は必須です' },
            { status: 400 }
        );
    }

    try {
        const authenticators = await getUserAuthenticators(username);
        return NextResponse.json({ authenticators });
    } catch (error) {
        console.error('Error getting authenticators:', error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
} 