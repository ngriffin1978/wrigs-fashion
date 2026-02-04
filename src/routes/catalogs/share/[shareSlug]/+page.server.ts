import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { catalogs, catalogItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const db = getDb();

	const [catalog] = await db
		.select()
		.from(catalogs)
		.where(and(eq(catalogs.shareSlug, params.shareSlug), eq(catalogs.isPublic, true)));

	if (!catalog) {
		throw error(404, 'Catalog not found');
	}

	const items = await db
		.select()
		.from(catalogItems)
		.where(eq(catalogItems.catalogId, catalog.id));

	return {
		catalog: {
			id: catalog.id,
			title: catalog.title,
			backgroundColor: catalog.backgroundColor
		},
		items: items.map((i) => ({
			id: i.id,
			imageUrl: i.imageUrl,
			positionX: i.positionX,
			positionY: i.positionY,
			width: i.width,
			height: i.height,
			rotation: i.rotation,
			zIndex: i.zIndex
		}))
	};
};
