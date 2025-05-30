import { PrismaClient } from '@prisma/client';

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
export async function saveAuthenticator(username: string, credentialId: string, publicKey: string, counter: number) {
    try {
        await prisma.authenticator.create({
            data: {
                username,
                credentialId,
                publicKey,
                counter,
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
        return await prisma.authenticator.findFirst({
            where: { username },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Error getting authenticator:', error);
        throw error;
    }
} 