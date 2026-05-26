import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDatabase } from './db/database';
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
getDatabase();

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
