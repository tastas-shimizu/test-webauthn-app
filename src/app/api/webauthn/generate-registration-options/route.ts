import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { saveChallenge } from '@/lib/db';

export async function POST(req: NextRequest) {
    const { username } = await req.json();

    // ユーザー名のバリデーション
    if (!username || !username.trim()) {
        return NextResponse.json(
            { error: 'ユーザー名は必須です' },
            { status: 400 }
        );
    }

    // ユーザー名をUint8Arrayに変換
    const userID = new TextEncoder().encode(username);

    const options = await generateRegistrationOptions({
        rpName: 'My WebAuthn App',
        rpID: 'localhost',
        userID,
        userName: username,
        timeout: 60000,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'discouraged',
            userVerification: 'discouraged',
            authenticatorAttachment: 'platform',
        },
    });

    console.log('Generated challenge:', options.challenge);

    // チャレンジをデータベースに保存
    await saveChallenge(username, options.challenge);

    return NextResponse.json(options);
}
