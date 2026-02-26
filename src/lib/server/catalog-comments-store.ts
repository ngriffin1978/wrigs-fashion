import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const FILE_PATH = '/home/clawdbot/.openclaw/workspace-paige/repos/ngriffin1978__wrigs-fashion/.data/catalog-comments.json';

type CatalogComment = {
  id: string;
  catalogId: string;
  parentId: string | null;
  author: string;
  message: string;
  createdAt: string;
};

function ensureFile() {
  const dir = path.dirname(FILE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ comments: [] }, null, 2), 'utf8');
}

function readDb(): { comments: CatalogComment[] } {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  } catch {
    return { comments: [] };
  }
}

function writeDb(db: { comments: CatalogComment[] }) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(db, null, 2), 'utf8');
}

export function listCatalogComments(catalogId: string) {
  const db = readDb();
  return (db.comments || [])
    .filter((c) => c.catalogId === catalogId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addCatalogComment(input: {
  catalogId: string;
  parentId?: string | null;
  author: string;
  message: string;
}) {
  const db = readDb();
  const comment: CatalogComment = {
    id: nanoid(12),
    catalogId: input.catalogId,
    parentId: input.parentId || null,
    author: input.author,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  db.comments = Array.isArray(db.comments) ? db.comments : [];
  db.comments.push(comment);
  writeDb(db);
  return comment;
}
