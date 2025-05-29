import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrations';

// データベースファイルのパス
const dbPath = path.join(process.cwd(), 'local.db');

// チャレンジの型定義
interface Challenge {
    challenge: string;
}

// データベースの初期化
export function initDatabase() {
    // データベースファイルが存在しない場合は作成
    if (!fs.existsSync(dbPath)) {
        const db = new Database(dbPath);
        db.close();
    }

    // マイグレーションの実行
    runMigrations();
}

// データベース接続を取得
export function getDatabase() {
    return new Database(dbPath);
}

// チャレンジの保存
export function saveChallenge(username: string, challenge: string) {
    console.log('Saving challenge for username:', username);
    const db = getDatabase();
    try {
        db.prepare(
            'INSERT INTO challenges (username, challenge) VALUES (?, ?)'
        ).run(username, challenge);
        console.log('Challenge saved successfully');
    } catch (error) {
        console.error('Error saving challenge:', error);
        throw error;
    } finally {
        db.close();
    }
}

// チャレンジの取得
export function getChallenge(username: string): string | undefined {
    console.log('Getting challenge for username:', username);
    const db = getDatabase();
    try {
        const result = db.prepare(
            'SELECT challenge FROM challenges WHERE username = ? ORDER BY created_at DESC LIMIT 1'
        ).get(username) as Challenge | undefined;
        console.log('Retrieved challenge:', result?.challenge);
        return result?.challenge;
    } catch (error) {
        console.error('Error getting challenge:', error);
        throw error;
    } finally {
        db.close();
    }
}

// チャレンジの削除
export function deleteChallenge(username: string) {
    console.log('Deleting challenge for username:', username);
    const db = getDatabase();
    try {
        db.prepare('DELETE FROM challenges WHERE username = ?').run(username);
        console.log('Challenge deleted successfully');
    } catch (error) {
        console.error('Error deleting challenge:', error);
        throw error;
    } finally {
        db.close();
    }
}

// 認証情報の保存
export function saveAuthenticator(username: string, credentialId: string, publicKey: string, counter: number) {
    const db = getDatabase();
    db.prepare(
        'INSERT INTO authenticators (username, credential_id, public_key, counter) VALUES (?, ?, ?, ?)'
    ).run(username, credentialId, publicKey, counter);
    db.close();
}

// 認証情報の取得
export function getAuthenticator(username: string) {
    const db = getDatabase();
    const result = db.prepare(
        'SELECT * FROM authenticators WHERE username = ? ORDER BY created_at DESC LIMIT 1'
    ).get(username);
    db.close();
    return result;
} 