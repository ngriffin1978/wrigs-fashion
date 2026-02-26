import { json, error, type RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { catalogs } from '$lib/server/db/schema';
import { getSessionId } from '$lib/server/session';
import { optionalAuth } from '$lib/server/auth/guards';
import { eq } from 'drizzle-orm';
import { addCatalogComment, listCatalogComments } from '$lib/server/catalog-comments-store';

async function verifyCatalogAccess(paramsId: string, cookies: any, locals: any) {
  const user = optionalAuth(locals);
  const sessionId = getSessionId(cookies);
  const db = getDb();
  const [catalog] = await db.select().from(catalogs).where(eq(catalogs.id, paramsId));
  if (!catalog) throw error(404, 'Catalog not found');

  const userIdMatch = user && catalog.userId === user.id;
  const sessionIdMatch = catalog.sessionId === sessionId;
  const isOwner = userIdMatch || sessionIdMatch;
  if (!isOwner && !catalog.isPublic) throw error(404, 'Catalog not found');

  return { catalog, user };
}

export const GET: RequestHandler = async ({ params, cookies, locals }) => {
  await verifyCatalogAccess(params.id!, cookies, locals);
  const comments = listCatalogComments(params.id!);
  return json({ comments });
};

export const POST: RequestHandler = async ({ params, cookies, locals, request }) => {
  const { user } = await verifyCatalogAccess(params.id!, cookies, locals);
  const body = await request.json().catch(() => ({}));
  const message = String(body?.message || '').trim();
  const parentId = body?.parentId ? String(body.parentId) : null;

  if (!message) return json({ error: 'message_required' }, { status: 400 });

  const author = user?.name || user?.email || 'Anonymous';
  const comment = addCatalogComment({
    catalogId: params.id!,
    parentId,
    author,
    message: message.slice(0, 2000),
  });

  return json({ ok: true, comment }, { status: 201 });
};
