import { Router, Request, Response } from 'express';
import { createGame, getGameState, submitGuess } from '../services/gameManager';
import { GameMode } from '@geoguess/shared';

export const gameRouter = Router();

// POST /api/games - Create a new game
gameRouter.post('/', (req: Request, res: Response) => {
  try {
    const { userId, mode } = req.body as { userId: string; mode: GameMode };

    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const validModes: GameMode[] = ['classic', 'timed', 'streak', 'challenge'];
    const gameMode = validModes.includes(mode) ? mode : 'classic';

    const game = createGame(userId, gameMode);
    const state = getGameState(game.id);

    res.status(201).json(state);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// GET /api/games/:id - Get game state
gameRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const state = getGameState(req.params.id);

    if (!state) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json(state);
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
});

// POST /api/games/:id/guess - Submit a guess
gameRouter.post('/:id/guess', (req: Request, res: Response) => {
  try {
    const { lat, lng, timeSeconds } = req.body as {
      lat: number;
      lng: number;
      timeSeconds: number;
    };

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'lat and lng are required' });
      return;
    }

    const result = submitGuess(
      req.params.id,
      lat,
      lng,
      timeSeconds || 0
    );

    if (!result) {
      res.status(400).json({ error: 'Cannot submit guess for this game' });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error submitting guess:', error);
    res.status(500).json({ error: 'Failed to submit guess' });
  }
});

// POST /api/games/:id/next - Get next round
gameRouter.post('/:id/next', (req: Request, res: Response) => {
  try {
    const state = getGameState(req.params.id);

    if (!state) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    if (state.game.status === 'completed') {
      res.status(400).json({ error: 'Game is already completed' });
      return;
    }

    res.json(state);
  } catch (error) {
    console.error('Error getting next round:', error);
    res.status(500).json({ error: 'Failed to get next round' });
  }
});

// GET /api/games/:id/results - Get final results
gameRouter.get('/:id/results', (req: Request, res: Response) => {
  try {
    const state = getGameState(req.params.id);

    if (!state) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json({
      game: state.game,
      rounds: state.rounds,
      total_score: state.game.total_score,
    });
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});
