import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// マイグレーションファイルのディレクトリ
const migrationsDir = path.join(process.cwd(), 'src', 'migrations');

// マイグレーション履歴テーブルの作成
function createMigrationsTable(db: Database.Database) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// マイグレーションファイルの読み込み
function loadMigrationFiles(): string[] {
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }
    return fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
}

// 適用済みのマイグレーションを取得
function getAppliedMigrations(db: Database.Database): string[] {
    const result = db.prepare('SELECT name FROM migrations ORDER BY id').all();
    return result.map((row: any) => row.name);
}

// マイグレーションの実行
export function runMigrations() {
    const dbPath = path.join(process.cwd(), 'local.db');
    const db = new Database(dbPath);

    try {
        // マイグレーション履歴テーブルの作成
        createMigrationsTable(db);

        // マイグレーションファイルの読み込み
        const migrationFiles = loadMigrationFiles();
        const appliedMigrations = getAppliedMigrations(db);

        // 未適用のマイグレーションを実行
        for (const file of migrationFiles) {
            if (!appliedMigrations.includes(file)) {
                console.log(`Applying migration: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
                
                // トランザクション内でマイグレーションを実行
                db.transaction(() => {
                    db.exec(sql);
                    db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
                })();

                console.log(`Migration ${file} applied successfully`);
            }
        }
    } finally {
        db.close();
    }
} 