import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const FILE = '/home/clawdbot/.openclaw/workspace-paige/repos/ngriffin1978__wrigs-fashion/.data/catalogs-fallback.json';

type Catalog = {
  id: string;
  sessionId: string;
  userId: string | null;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items: any[];
};

function ensure() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ catalogs: [] }, null, 2), 'utf8');
}

function readDb(): { catalogs: Catalog[] } {
  ensure();
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { catalogs: [] }; }
}

function writeDb(db: { catalogs: Catalog[] }) {
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
}

export function createFallbackCatalog(input: { sessionId: string; userId: string | null; title: string }) {
  const db = readDb();
  const now = new Date().toISOString();
  const row: Catalog = {
    id: nanoid(12),
    sessionId: input.sessionId,
    userId: input.userId,
    title: input.title,
    isPublic: false,
    createdAt: now,
    updatedAt: now,
    items: [],
  };
  db.catalogs.unshift(row);
  writeDb(db);
  return row;
}

export function listFallbackCatalogs(input: { sessionId: string; userId: string | null }) {
  const db = readDb();
  return db.catalogs.filter((c) => c.sessionId === input.sessionId || (!!input.userId && c.userId === input.userId));
}

export function getFallbackCatalog(id: string, input: { sessionId: string; userId: string | null }) {
  const db = readDb();
  const row = db.catalogs.find((c) => c.id === id);
  if (!row) return null;
  const isOwner = row.sessionId === input.sessionId || (!!input.userId && row.userId === input.userId);
  if (!isOwner && !row.isPublic) return null;
  return row;
}
