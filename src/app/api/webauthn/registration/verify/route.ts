import { verifyRegistrationResponse, AuthenticatorTransport } from '@simplewebauthn/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getChallenge, deleteChallenge, saveAuthenticator } from '@/lib/db';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'https://localhost:3001';

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log('Received verification request body:', JSON.stringify(body, null, 2));

    try {
        // ユーザー名を取得
        const username = body.userName;
        console.log('Verifying registration for username:', username);

        const expectedChallenge = await getChallenge(username);
        console.log('Expected challenge:', expectedChallenge);

        if (!expectedChallenge) {
            console.log('No challenge found for username:', username);
            return NextResponse.json(
                { error: 'チャレンジが見つかりません' },
                { status: 400 }
            );
        }

        console.log('Verifying with challenge:', expectedChallenge);
        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            requireUserVerification: false,
        });

        console.log('Verification result:', verification);

        if (verification.verified && verification.registrationInfo) {
            console.log('Registration verified successfully', verification);
            // 認証情報を保存
            await saveAuthenticator(
                username,
                verification.registrationInfo.credential.id,
                verification.registrationInfo.credential.publicKey,
                verification.registrationInfo.credential.counter,
                (verification.registrationInfo.credential.transports || ['usb', 'ble', 'nfc', 'internal']) as AuthenticatorTransport[],
                body.deviceType || 'unknown',
                body.deviceName || 'unknown'
            );

            // チャレンジを削除
            await deleteChallenge(username);

            return NextResponse.json({ verified: true });
        } else {
            console.log('Registration verification failed');
            return NextResponse.json({ verified: false }, { status: 400 });
        }
    } catch (err) {
        console.error('Verification error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
