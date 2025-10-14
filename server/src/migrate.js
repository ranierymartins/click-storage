import { ensureDB } from './db.js';

(async () => {
  await ensureDB();
  console.log('Database initialized (lowdb)');
})();
