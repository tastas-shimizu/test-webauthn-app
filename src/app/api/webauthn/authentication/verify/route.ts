import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getChallenge, deleteChallenge, getAuthenticator, updateAuthenticatorLastUsed } from '@/lib/db';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'https://localhost:3001';

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log('Received verification request body:', JSON.stringify(body, null, 2));

    try {
        // ユーザー名を取得
        const username = body.userName;
        console.log('Verifying authentication for username:', username);

        const expectedChallenge = await getChallenge(username);
        console.log('Expected challenge:', expectedChallenge);

        if (!expectedChallenge) {
            console.log('No challenge found for username:', username);
            return NextResponse.json(
                { error: 'チャレンジが見つかりません' },
                { status: 400 }
            );
        }

        // 認証機の情報を取得
        const authenticator = await getAuthenticator(username);
        if (!authenticator) {
            return NextResponse.json(
                { error: '認証機の情報が見つかりません' },
                { status: 400 }
            );
        }

        console.log('Verifying with challenge:', expectedChallenge);
        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            credential: {
                id: authenticator.credentialId,
                publicKey: authenticator.publicKey,
                counter: authenticator.counter,
            },
            requireUserVerification: false,
        });

        console.log('Verification result:', verification);

        if (verification.verified) {
            console.log('Authentication verified successfully');
            // チャレンジを削除
            await deleteChallenge(username);
            // 最終使用日時を更新
            await updateAuthenticatorLastUsed(authenticator.credentialId);

            return NextResponse.json({ verified: true });
        } else {
            console.log('Authentication verification failed');
            return NextResponse.json({ verified: false }, { status: 400 });
        }
    } catch (err) {
        console.error('Verification error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
} 