const request = require('supertest');

// Mock words module for consistent testing
jest.mock('../../words', () => ({
  getTodaysWord: () => 'stole',
  isValidWord: (word) => {
    const validWords = ['huset', 'stole', 'borde', 'lampe', 'stege'];
    return validWords.includes(word.toLowerCase());
  }
}));

describe('API Basic Tests', () => {
  let app;

  beforeEach(() => {
    // Clear require cache and get fresh app
    delete require.cache[require.resolve('../../server.js')];
    app = require('../../server.js');
  });

  describe('GET /health', () => {
    test('should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });
  });

  describe('GET /game', () => {
    test('should start new game', async () => {
      const response = await request(app)
        .get('/game')
        .expect(200);

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
  });

  describe('POST /guess', () => {
    test('should accept valid guess', async () => {
      const agent = request.agent(app);
      
      // Start game first
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: 'huset' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.attempts).toBe(1);
      expect(response.body.data.gameState).toBe('playing');
    });

    test('should reject invalid word length', async () => {
      const agent = request.agent(app);
      await agent.get('/game');

      const response = await agent
        .post('/guess')
        .send({ guess: 'test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('5 letters');
    });
  });
});