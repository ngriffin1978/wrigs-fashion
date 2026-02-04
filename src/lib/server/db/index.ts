import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

type DB = MySql2Database<typeof schema>;

let _db: DB | null = null;

export function getDb(): DB {
	if (!_db) {
		const url = env.DATABASE_URL || 'mysql://wrigs_user:password@localhost:3306/wrigs_fashion';
		const pool = mysql.createPool(url);
		_db = drizzle(pool, { schema, mode: 'default' });
	}
	return _db;
}

export { schema };
