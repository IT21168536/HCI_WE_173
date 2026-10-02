import * as SQLite from 'expo-sqlite';
import { schemaStatements } from './schema';
import { seedDemoData } from './seed';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('worky-kitchen.db');
  }

  const db = await dbPromise;
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  for (const statement of schemaStatements) {
    await db.execAsync(statement);
  }

  await seedDemoData(db);
}
