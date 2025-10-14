import { ensureDB } from './db';

(async () => {
	await ensureDB();
	console.log('Database initialized (lowdb)');
})();
