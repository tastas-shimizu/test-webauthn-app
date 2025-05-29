import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const rpID = 'localhost';

export async function POST(req: NextRequest) {
    const body = await req.json();

    try {
        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: body.response.clientDataJSON.challenge, // クライアントから送られてきたチャレンジを使用
            expectedOrigin: 'https://localhost:3001',
            expectedRPID: rpID,
        });

        if (verification.verified) {
            return NextResponse.json({ verified: true });
        } else {
            return NextResponse.json({ verified: false }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
