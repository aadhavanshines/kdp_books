import { loadConfig } from '../config';
import { openDb } from '../db';
import { seedDatabase } from './index';

// `npm run seed -w server`: wipe and re-seed the local database.
const config = loadConfig();
const db = openDb(config.dbPath);
const started = Date.now();
const summary = seedDatabase(db, { now: started });
db.close();
console.info(`Seeded ${config.dbPath} in ${Date.now() - started} ms`, summary);
