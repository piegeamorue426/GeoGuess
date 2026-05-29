import { Router, Request, Response } from 'express';
import { createGame, getGameState, submitGuess, advanceToNextRound } from '../services/gameManager';
import { calculateXP } from '../services/scoring';
import { GameMode } from '@geoguess/shared';
import { validateCreateGame, validateGuess, validateGameId } from '../middleware/validation';

export const gameRouter = Router();

const VALID_MODES: GameMode[] = ['classic', 'infinite', 'hardcore', 'no_move', 'no_pan', 'country_streak'];

// POST /api/games - Create a new game
gameRouter.post('/', validateCreateGame, (req: Request, res: Response) => {
  try {
    const { userId, mode } = req.body as { userId: string; mode: GameMode };

    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const gameMode: GameMode = VALID_MODES.includes(mode) ? mode : 'classic';

    const game = createGame(userId, gameMode);
    const state = getGameState(game.id);

    res.status(201).json(state);
  } catch (error) {
    const err = error as Error;
    console.error('Error creating game:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// GET /api/games/:id - Get game state
gameRouter.get('/:id', validateGameId, (req: Request, res: Response) => {
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
gameRouter.post('/:id/guess', validateGameId, validateGuess, (req: Request, res: Response) => {
  try {
    const { lat, lng, timeSeconds, country } = req.body as {
      lat?: number;
      lng?: number;
      timeSeconds?: number;
      country?: string;
    };

    const result = submitGuess(
      req.params.id,
      lat || 0,
      lng || 0,
      timeSeconds || 0,
      country
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
gameRouter.post('/:id/next', validateGameId, (req: Request, res: Response) => {
  try {
    const state = advanceToNextRound(req.params.id);

    if (!state) {
      res.status(400).json({ error: 'Cannot advance to next round' });
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
gameRouter.get('/:id/results', validateGameId, (req: Request, res: Response) => {
  try {
    const state = getGameState(req.params.id);

    if (!state) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const xpEarned = calculateXP(state.game.total_score);

    res.json({
      game: state.game,
      rounds: state.rounds,
      total_score: state.game.total_score,
      xp_earned: xpEarned,
      restrictions: state.restrictions,
    });
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});
