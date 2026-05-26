import { v4 as uuidv4 } from 'uuid';
import { getDatabase, closeDatabase } from './database';
import { seedLocations } from '../data/locations';
import dotenv from 'dotenv';

dotenv.config();

function seed(): void {
  const db = getDatabase();

  const existing = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
  if (existing.count > 0) {
    console.log(`Database already has ${existing.count} locations. Skipping seed.`);
    closeDatabase();
    return;
  }

  const insert = db.prepare(
    'INSERT INTO locations (id, lat, lng, country, city, region, difficulty, description, panorama_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction((locations: typeof seedLocations) => {
    for (const loc of locations) {
      insert.run(
        uuidv4(),
        loc.lat,
        loc.lng,
        loc.country,
        loc.city,
        loc.region,
        loc.difficulty,
        loc.description,
        loc.panorama_url
      );
    }
  });

  insertMany(seedLocations);
  console.log(`Seeded ${seedLocations.length} locations into the database.`);

  closeDatabase();
}

seed();
