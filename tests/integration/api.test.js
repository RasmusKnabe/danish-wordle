const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');

// Mock words module for consistent testing
jest.mock('../../words', () => ({
  getTodaysWord: jest.fn(() => 'stole'),
  isValidWord: jest.fn((word) => {
    const validWords = ['huset', 'stole', 'borde', 'lampe', 'stege', 'plads', 'efter'];
    return validWords.includes(word.toLowerCase());
  })
}));

describe('API Integration Tests', () => {
  let app;
  let server;

  beforeEach(() => {
    // Clear require cache to get fresh app instance
    jest.resetModules();
    delete require.cache[require.resolve('../../server.js')];
    
    // Require app after mocking
    app = require('../../server.js');
    
    // Start server on random port for testing
    server = app.listen(0);
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('GET /game', () => {
    test('should start new game and return initial state', async () => {
      const response = await request(app)
        .get('/game')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        success: true,
        data: {
          gameState: 'playing',
          attempts: 0,
          maxAttempts: 6,
          guesses: [],
          lastGuess: null,
          word: null
        }
      });
    });

    test('should set session cookie', async () => {
      const response = await request(app)
        .get('/game')
        .expect(200);

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/wordleSession=/);
    });

    test('should maintain same game state for same session', async () => {
      const agent = request.agent(app);

      // First request
      const response1 = await agent
        .get('/game')
        .expect(200);

      // Make a guess to change state
      await agent
        .post('/guess')
        .send({ guess: 'huset' })
        .expect(200);

      // Second request should maintain state
      const response2 = await agent
        .get('/game')
        .expect(200);

      expect(response2.body.data.attempts).toBe(1);
      expect(response2.body.data.guesses).toHaveLength(1);
    });
  });

  describe('POST /guess', () => {
    test('should accept valid guess and return feedback', async () => {
      const agent = request.agent(app);

      // Start game first
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: 'huset' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gameState).toBe('playing');
      expect(response.body.data.attempts).toBe(1);
      expect(response.body.data.lastGuess).toEqual({
        word: 'huset',
        feedback: expect.arrayContaining([
          expect.objectContaining({
            letter: expect.any(String),
            status: expect.stringMatching(/^(correct|wrong-position|wrong)$/)
          })
        ])
      });
    });

    test('should win when correct word is guessed', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: 'stole' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gameState).toBe('won');
      expect(response.body.data.word).toBe('stole');
    });

    test('should reject invalid word length', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: 'test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/5 letters/);
    });

    test('should reject invalid Danish word', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: 'xxxxx' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/valid Danish word/);
    });

    test('should reject missing guess', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject empty guess', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should lose after 6 wrong guesses', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      // Make 5 wrong guesses
      for (let i = 0; i < 5; i++) {
        const response = await agent
          .post('/guess')
          .send({ guess: 'huset' })
          .expect(200);
        expect(response.body.data.gameState).toBe('playing');
      }

      // 6th guess should end game
      const response = await agent
        .post('/guess')
        .send({ guess: 'huset' })
        .expect(200);

      expect(response.body.data.gameState).toBe('lost');
      expect(response.body.data.word).toBe('stole');
    });

    test('should not accept guesses after game ends', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      // Win the game
      await agent
        .post('/guess')
        .send({ guess: 'stole' })
        .expect(200);

      // Try to make another guess
      const response = await agent
        .post('/guess')
        .send({ guess: 'huset' })
        .expect(200);

      expect(response.body.data.gameState).toBe('won'); // Should stay won
    });

    test('should handle case insensitive input', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: 'HUSET' })
        .expect(200);

      expect(response.body.data.lastGuess.word).toBe('huset');
    });
  });

  describe('GET /health', () => {
    test('should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });

      // Validate timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
      
      // Uptime should be positive number
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error handling', () => {
    test('should return 404 for unknown endpoints', async () => {
      await request(app)
        .get('/unknown')
        .expect(404);
    });

    test('should handle malformed JSON', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .set('Content-Type', 'application/json')
        .send('{"guess": invalid json}')
        .expect(400);
    });
  });

  describe('Session management', () => {
    test('should create new session for each new client', async () => {
      const agent1 = request.agent(app);
      const agent2 = request.agent(app);

      // Both agents start games
      await agent1.get('/game');
      await agent2.get('/game');

      // Agent1 makes a guess
      await agent1.post('/guess').send({ guess: 'huset' });

      // Agent2's game should be unaffected
      const response = await agent2.get('/game');
      expect(response.body.data.attempts).toBe(0);
    });

    test('should maintain session across requests', async () => {
      const agent = request.agent(app);

      await agent.get('/game');
      
      // Make first guess
      await agent.post('/guess').send({ guess: 'huset' });
      
      // Make second guess
      const response = await agent.post('/guess').send({ guess: 'borde' });
      
      expect(response.body.data.attempts).toBe(2);
      expect(response.body.data.guesses).toHaveLength(2);
    });
  });

  describe('Content-Type validation', () => {
    test('should accept application/json content type', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      await agent
        .post('/guess')
        .set('Content-Type', 'application/json')
        .send({ guess: 'huset' })
        .expect(200);
    });

    test('should reject non-JSON content types for POST requests', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      await agent
        .post('/guess')
        .set('Content-Type', 'text/plain')
        .send('huset')
        .expect(400);
    });
  });
});