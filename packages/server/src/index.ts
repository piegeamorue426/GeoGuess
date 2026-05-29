import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './db/database';
import { seedLocations } from './data/locations';
import { gameRouter } from './routes/game';
import { locationsRouter } from './routes/locations';
import { statsRouter } from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Initialize database
const db = getDatabase();

// Seed locations if the table is empty
const { count } = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number };
if (count === 0) {
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
  console.log(`Auto-seeded ${seedLocations.length} locations into the database.`);
}

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/games', gameRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
