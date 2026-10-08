/* eslint-disable @typescript-eslint/no-explicit-any */
// Test-only stand-in for expo-sqlite backed by Node's built-in SQLite.
import { DatabaseSync } from 'node:sqlite';

function norm(params: unknown[]): unknown[] {
  if (params.length === 1 && Array.isArray(params[0])) return params[0] as unknown[];
  return params;
}

export type SQLiteDatabase = ReturnType<typeof wrap>;

function wrap(db: DatabaseSync) {
  return {
    async execAsync(sql: string) { db.exec(sql); },
    async runAsync(sql: string, ...params: unknown[]) {
      const r = db.prepare(sql).run(...(norm(params) as any[]));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getFirstAsync<T>(sql: string, ...params: unknown[]) {
      return (db.prepare(sql).get(...(norm(params) as any[])) ?? null) as T | null;
    },
    async getAllAsync<T>(sql: string, ...params: unknown[]) {
      return db.prepare(sql).all(...(norm(params) as any[])) as T[];
    },
    async withTransactionAsync(task: () => Promise<void>) {
      db.exec('BEGIN');
      try { await task(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; }
    },
  };
}

export async function openDatabaseAsync(_name: string) {
  return wrap(new DatabaseSync(':memory:'));
}
