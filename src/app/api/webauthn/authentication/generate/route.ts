import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthenticator, saveChallenge } from '@/lib/db';

const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';

export async function POST(req: NextRequest) {
    const { username } = await req.json();

    // ユーザー名のバリデーション
    if (!username || !username.trim()) {
        return NextResponse.json(
            { error: 'ユーザー名は必須です' },
            { status: 400 }
        );
    }

    // 認証機の情報を取得
    const authenticator = await getAuthenticator(username);
    if (!authenticator) {
        return NextResponse.json(
            { error: '登録済みの認証機が見つかりません' },
            { status: 400 }
        );
    }

    // 認証オプションを生成
    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: [{
            id: authenticator.credentialId,
            // transports: authenticator.transports, // Windows Hello だとコメントアウトしないと動かない
        }],
        userVerification: 'preferred',
        timeout: 60000,
    });

    // チャレンジを保存
    await saveChallenge(username, options.challenge);

    return NextResponse.json(options);
} 