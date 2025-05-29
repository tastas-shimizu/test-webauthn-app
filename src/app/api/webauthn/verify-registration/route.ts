import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { initDatabase, getChallenge, deleteChallenge, saveAuthenticator } from '@/lib/db';

const rpID = 'localhost';

// データベースの初期化
initDatabase();

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log('Received verification request body:', JSON.stringify(body, null, 2));

    try {
        // ユーザー名を取得
        const username = body.userName;
        console.log('Verifying registration for username:', username);

        const expectedChallenge = getChallenge(username);
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
            expectedOrigin: 'https://localhost:3001',
            expectedRPID: rpID,
            requireUserVerification: false,
        });

        console.log('Verification result:', verification);

        if (verification.verified && verification.registrationInfo) {
            console.log('Registration verified successfully');
            // 認証情報を保存
            saveAuthenticator(
                username,
                Buffer.from(verification.registrationInfo.credential.id).toString('base64'),
                Buffer.from(verification.registrationInfo.credential.publicKey).toString('base64'),
                verification.registrationInfo.credential.counter
            );

            // チャレンジを削除
            deleteChallenge(username);

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
