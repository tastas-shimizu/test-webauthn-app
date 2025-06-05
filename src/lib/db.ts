import { PrismaClient } from '@prisma/client';
import { AuthenticatorTransport } from '@simplewebauthn/server';

const prisma = new PrismaClient();

// チャレンジの保存
export async function saveChallenge(username: string, challenge: string) {
    console.log('Saving challenge for username:', username);
    try {
        await prisma.challenge.create({
            data: {
                username,
                challenge,
            },
        });
        console.log('Challenge saved successfully');
    } catch (error) {
        console.error('Error saving challenge:', error);
        throw error;
    }
}

// チャレンジの取得
export async function getChallenge(username: string): Promise<string | undefined> {
    console.log('Getting challenge for username:', username);
    try {
        const result = await prisma.challenge.findFirst({
            where: { username },
            orderBy: { createdAt: 'desc' },
        });
        console.log('Retrieved challenge:', result?.challenge);
        return result?.challenge;
    } catch (error) {
        console.error('Error getting challenge:', error);
        throw error;
    }
}

// チャレンジの削除
export async function deleteChallenge(username: string) {
    console.log('Deleting challenge for username:', username);
    try {
        await prisma.challenge.deleteMany({
            where: { username },
        });
        console.log('Challenge deleted successfully');
    } catch (error) {
        console.error('Error deleting challenge:', error);
        throw error;
    }
}

// 認証情報の保存
export async function saveAuthenticator(
    username: string,
    credentialId: string,
    publicKey: Uint8Array,
    counter: number,
    transports: AuthenticatorTransport[],
    deviceType: string,
    deviceName: string
) {
    try {
        await prisma.authenticator.create({
            data: {
                username,
                credentialId,
                publicKey: Buffer.from(publicKey).toString('base64'),
                counter,
                transports: JSON.stringify(transports),
                deviceType,
                deviceName,
            },
        });
    } catch (error) {
        console.error('Error saving authenticator:', error);
        throw error;
    }
}

// 認証情報の取得
export async function getAuthenticator(username: string) {
    try {
        const authenticator = await prisma.authenticator.findFirst({
            where: { username },
            orderBy: { lastUsedAt: 'desc' },
        });
        console.log('Retrieved authenticator:', authenticator);
        if (authenticator) {
            return {
                ...authenticator,
                credentialId: authenticator.credentialId,
                publicKey: new Uint8Array(Buffer.from(authenticator.publicKey, 'base64')),
                transports: JSON.parse(authenticator.transports) as AuthenticatorTransport[],
            };
        }
        return authenticator;
    } catch (error) {
        console.error('Error getting authenticator:', error);
        throw error;
    }
}

// ユーザーの全認証器を取得
export async function getUserAuthenticators(username: string) {
    try {
        const authenticators = await prisma.authenticator.findMany({
            where: { username },
            orderBy: { lastUsedAt: 'desc' },
        });
        return authenticators.map(auth => ({
            ...auth,
            transports: JSON.parse(auth.transports) as AuthenticatorTransport[],
        }));
    } catch (error) {
        console.error('Error getting user authenticators:', error);
        throw error;
    }
}

// 認証器の最終使用日時を更新
export async function updateAuthenticatorLastUsed(credentialId: string) {
    try {
        await prisma.authenticator.update({
            where: { credentialId },
            data: { lastUsedAt: new Date() },
        });
    } catch (error) {
        console.error('Error updating authenticator last used:', error);
        throw error;
    }
}

// 認証器の削除
export async function deleteAuthenticator(credentialId: string) {
    try {
        await prisma.authenticator.delete({
            where: { credentialId },
        });
    } catch (error) {
        console.error('Error deleting authenticator:', error);
        throw error;
    }
} 