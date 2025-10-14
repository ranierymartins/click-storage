Local JSON file storage server

This project includes a small local API server that persists data to `server/data/db.json`.

Quick start (from project root):

1. Install server dependencies:
   cd server
   npm install

2. Initialize the DB file (creates `server/data/db.json` if missing):
   node src/migrate.js

3. Optionally populate example data (idempotent):
   node src/seed.js

4. Start the local API server:
   node src/index.js

API base URL: http://localhost:4000

Main endpoints:
- GET /products, POST /products, PUT /products/:id, DELETE /products/:id
- GET /customers, POST /customers, PUT /customers/:id, DELETE /customers/:id
- GET /customer_products, POST /customer_products, DELETE /customer_products/:id

Data stored in `server/data/db.json`:
- products, customers, companies, customer_products (associations), accessories, maintenance_items, customer_accessories

Frontend:
- The frontend uses `src/lib/api.ts` which defaults to `http://localhost:4000` or the value set in `VITE_API_URL`.

Notes:
- The server now writes a JSON file directly (atomic write using temporary file + rename).
- `seed.js` is idempotent: running multiple times won't duplicate records with the same id.

Want me to:
- Add a root script to start both frontend and server with one command.
- Add pagination/search or other endpoints you need.
