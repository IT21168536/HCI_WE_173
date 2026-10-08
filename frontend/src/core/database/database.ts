import * as SQLite from 'expo-sqlite';
import { columnMigrations, schemaStatements } from './schema';
import { seedDemoData } from './seed';

const DATABASE_NAME = 'worky-kitchen-v2.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Opens the local database once per app session and runs schema setup,
 * migrations and demo seeding a single time. Every repository shares it.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndPrepare().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

async function openAndPrepare() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  for (const statement of schemaStatements) {
    await db.execAsync(statement);
  }

  await runColumnMigrations(db);
  await seedDemoData(db);
  return db;
}

async function runColumnMigrations(db: SQLite.SQLiteDatabase) {
  for (const migration of columnMigrations) {
    const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${migration.table})`);
    if (!columns.some((column) => column.name === migration.column)) {
      await db.execAsync(`ALTER TABLE ${migration.table} ADD COLUMN ${migration.column} ${migration.definition}`);
    }
  }
}
