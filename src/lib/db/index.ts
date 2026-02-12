import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Resume } from '@/types/resume';

const DB_PATH = path.join(process.cwd(), 'data', 'resumebuilder.db');

function getDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __db?: Database.Database };
  if (g.__db) return g.__db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS resume_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      label TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  g.__db = db;
  return db;
}

export interface StoredResume {
  id: string;
  data: Resume;
  createdAt: string;
  updatedAt: string;
}

export function getResume(): StoredResume | null {
  const db = getDb();
  const row = db.prepare('SELECT id, data, created_at, updated_at FROM resumes WHERE id = ?').get('default') as
    | { id: string; data: string; created_at: string; updated_at: string }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    data: JSON.parse(row.data) as Resume,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function saveResume(resume: Resume, label?: string): StoredResume {
  const db = getDb();
  const now = new Date().toISOString();
  const jsonData = JSON.stringify(resume);

  db.prepare(`
    INSERT INTO resumes (id, data, created_at, updated_at)
    VALUES ('default', ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(jsonData, now, now);

  // Also record in history
  db.prepare(
    'INSERT INTO resume_history (data, label, created_at) VALUES (?, ?, ?)'
  ).run(jsonData, label ?? null, now);

  return { id: 'default', data: resume, createdAt: now, updatedAt: now };
}

export function deleteResume(): void {
  const db = getDb();
  db.prepare('DELETE FROM resumes WHERE id = ?').run('default');
}

// --- History ---

export interface ResumeHistoryEntry {
  id: number;
  data: Resume;
  label: string | null;
  createdAt: string;
}

export function addHistory(resume: Resume, label?: string): ResumeHistoryEntry {
  const db = getDb();
  const now = new Date().toISOString();
  const jsonData = JSON.stringify(resume);

  const result = db.prepare(
    'INSERT INTO resume_history (data, label, created_at) VALUES (?, ?, ?)'
  ).run(jsonData, label ?? null, now);

  return {
    id: Number(result.lastInsertRowid),
    data: resume,
    label: label ?? null,
    createdAt: now,
  };
}

export function getHistory(limit = 50): Omit<ResumeHistoryEntry, 'data'>[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT id, label, created_at FROM resume_history ORDER BY id DESC LIMIT ?'
  ).all(limit) as { id: number; label: string | null; created_at: string }[];

  return rows.map(r => ({
    id: r.id,
    label: r.label,
    createdAt: r.created_at,
  }));
}

export function getHistoryEntry(id: number): ResumeHistoryEntry | null {
  const db = getDb();
  const row = db.prepare(
    'SELECT id, data, label, created_at FROM resume_history WHERE id = ?'
  ).get(id) as { id: number; data: string; label: string | null; created_at: string } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    data: JSON.parse(row.data) as Resume,
    label: row.label,
    createdAt: row.created_at,
  };
}

export function deleteHistoryEntry(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM resume_history WHERE id = ?').run(id);
}

export function clearHistory(): void {
  const db = getDb();
  db.prepare('DELETE FROM resume_history').run();
}
