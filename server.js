const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const WordleGame = require('./game');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for game sessions
const gameSessions = new Map();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Helper function to get or create game session
function getGameSession(req, res) {
  let sessionId = req.cookies.wordleSession;
  
  if (!sessionId || !gameSessions.has(sessionId)) {
    sessionId = uuidv4();
    const game = new WordleGame();
    gameSessions.set(sessionId, game);
    
    // Calculate milliseconds until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    res.cookie('wordleSession', sessionId, {
      httpOnly: true,
      maxAge: msUntilMidnight,
      sameSite: 'strict'
    });
  }
  
  return {
    sessionId,
    game: gameSessions.get(sessionId)
  };
}

// GET /game - Get current game state
app.get('/game', (req, res) => {
  try {
    const { game } = getGameSession(req, res);
    const gameState = game.getGameState();
    
    res.json({
      success: true,
      data: gameState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /guess - Make a guess
app.post('/guess', (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word) {
      return res.status(400).json({
        success: false,
        error: 'Word is required'
      });
    }

    const { game } = getGameSession(req, res);
    const result = game.makeGuess(word);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    let statusCode = 400;
    let errorMessage = error.message;
    
    if (error.message === 'Internal server error') {
      statusCode = 500;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Wordle backend server running on port ${PORT}`);
  });
}

module.exports = app;