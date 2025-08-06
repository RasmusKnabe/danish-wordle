const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock words module for testing
jest.mock('../../words', () => ({
  getTodaysWord: () => 'stole',
  isValidWord: (word) => {
    const validWords = ['huset', 'stole', 'borde', 'lampe', 'stege'];
    return validWords.includes(word.toLowerCase());
  }
}));

const WordleGame = require('../../game');

describe('WordleGame Basic Tests', () => {
  let game;

  beforeEach(() => {
    game = new WordleGame();
  });

  test('should initialize with correct default values', () => {
    expect(game.targetWord).toBe('stole');
    expect(game.guesses).toEqual([]);
    expect(game.maxGuesses).toBe(6);
    expect(game.gameState).toBe('playing');
  });

  test('should accept valid 5-letter word', () => {
    const result = game.makeGuess('huset');
    
    expect(result.gameState).toBe('playing');
    expect(result.attempts).toBe(1);
    expect(result.guesses).toHaveLength(1);
    expect(result.lastGuess.word).toBe('huset');
  });

  test('should reject invalid word length', () => {
    expect(() => game.makeGuess('test')).toThrow('Word must be exactly 5 letters');
    expect(() => game.makeGuess('testing')).toThrow('Word must be exactly 5 letters');
  });

  test('should win when correct word is guessed', () => {
    const result = game.makeGuess('stole');
    
    expect(result.gameState).toBe('won');
    expect(result.word).toBe('stole');
  });

  test('should provide correct feedback for exact match', () => {
    const result = game.makeGuess('stole');
    const feedback = result.lastGuess.feedback;
    
    expect(feedback).toEqual([
      { letter: 's', status: 'correct' },
      { letter: 't', status: 'correct' },
      { letter: 'o', status: 'correct' },
      { letter: 'l', status: 'correct' },
      { letter: 'e', status: 'correct' }
    ]);
  });

  test('should handle case insensitive input', () => {
    const result = game.makeGuess('STOLE');
    expect(result.gameState).toBe('won');
  });

  test('should lose after 6 incorrect guesses', () => {
    // Make 5 wrong guesses
    for (let i = 0; i < 5; i++) {
      const result = game.makeGuess('huset');
      expect(result.gameState).toBe('playing');
    }

    // 6th wrong guess should end game
    const result = game.makeGuess('huset');
    expect(result.gameState).toBe('lost');
    expect(result.word).toBe('stole');
  });

  test('should not accept guesses after game ends', () => {
    game.makeGuess('stole'); // Win the game
    
    const result = game.makeGuess('huset');
    expect(result.gameState).toBe('won'); // Should stay won
  });
});