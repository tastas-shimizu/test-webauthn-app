import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { deleteAuthenticator } from '@/lib/db';

export async function POST(req: NextRequest) {
    const { credentialId } = await req.json();
    if (!credentialId) {
        return NextResponse.json(
            { error: '認証器IDは必須です' },
            { status: 400 }
        );
    }

    try {
        await deleteAuthenticator(credentialId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting authenticator:', error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
} 