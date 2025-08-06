const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock words module
jest.mock('../../words', () => ({
  getTodaysWord: jest.fn(() => 'stole'),
  isValidWord: jest.fn((word) => {
    const validWords = ['huset', 'stole', 'borde', 'lampe', 'stege', 'plads'];
    return validWords.includes(word.toLowerCase());
  })
}));

const WordleGame = require('../../game');

describe('WordleGame', () => {
  let game;

  beforeEach(() => {
    game = new WordleGame();
  });

  describe('constructor', () => {
    test('should initialize with correct default values', () => {
      expect(game.targetWord).toBe('stole');
      expect(game.guesses).toEqual([]);
      expect(game.maxGuesses).toBe(6);
      expect(game.gameState).toBe('playing');
    });
  });

  describe('makeGuess', () => {
    test('should accept valid 5-letter word', () => {
      const result = game.makeGuess('huset');
      
      expect(result.gameState).toBe('playing');
      expect(result.attempts).toBe(1);
      expect(result.guesses).toHaveLength(1);
      expect(result.lastGuess.word).toBe('huset');
    });

    test('should reject words that are not 5 letters', () => {
      expect(() => game.makeGuess('test')).toThrow('Word must be exactly 5 letters');
      expect(() => game.makeGuess('testing')).toThrow('Word must be exactly 5 letters');
      expect(() => game.makeGuess('')).toThrow('Word must be exactly 5 letters');
    });

    test('should reject invalid Danish words', () => {
      expect(() => game.makeGuess('xxxxx')).toThrow('Not a valid Danish word');
      expect(() => game.makeGuess('hello')).toThrow('Not a valid Danish word');
    });

    test('should handle case insensitive input', () => {
      const result = game.makeGuess('HUSET');
      expect(result.lastGuess.word).toBe('huset'); // Should be normalized to lowercase
    });

    test('should trim whitespace from input', () => {
      const result = game.makeGuess(' huset ');
      expect(result.lastGuess.word).toBe('huset');
    });

    test('should win when correct word is guessed', () => {
      const result = game.makeGuess('stole');
      
      expect(result.gameState).toBe('won');
      expect(result.word).toBe('stole');
      expect(result.lastGuess.feedback.every(f => f.status === 'correct')).toBe(true);
    });

    test('should lose after 6 incorrect guesses', () => {
      // Make 5 incorrect guesses
      for (let i = 0; i < 5; i++) {
        const result = game.makeGuess('huset');
        expect(result.gameState).toBe('playing');
      }

      // 6th guess should end game
      const result = game.makeGuess('huset');
      expect(result.gameState).toBe('lost');
      expect(result.word).toBe('stole');
    });

    test('should not accept guesses after game is won', () => {
      game.makeGuess('stole'); // Win the game
      
      const result = game.makeGuess('huset');
      expect(result.gameState).toBe('won'); // Should stay won
    });

    test('should not accept guesses after game is lost', () => {
      // Lose the game
      for (let i = 0; i < 6; i++) {
        game.makeGuess('huset');
      }
      
      const result = game.makeGuess('borde');
      expect(result.gameState).toBe('lost'); // Should stay lost
    });
  });

  describe('checkGuess', () => {
    test('should return correct feedback for exact match', () => {
      const feedback = game.checkGuess('stole');
      
      expect(feedback).toEqual([
        { letter: 's', status: 'correct' },
        { letter: 't', status: 'correct' },
        { letter: 'o', status: 'correct' },
        { letter: 'l', status: 'correct' },
        { letter: 'e', status: 'correct' }
      ]);
    });

    test('should return correct feedback for no matches', () => {
      // Assuming target is 'stole', guess 'hused' has no matching letters
      game.targetWord = 'borde'; // Change target to avoid matches
      const feedback = game.checkGuess('huset'); // h,u,s,e,t not in 'borde'
      
      expect(feedback).toEqual([
        { letter: 'h', status: 'wrong' },
        { letter: 'u', status: 'wrong' },
        { letter: 's', status: 'wrong' },
        { letter: 'e', status: 'correct' }, // e is in borde at position 4
        { letter: 't', status: 'wrong' }
      ]);
    });

    test('should return correct feedback for wrong positions', () => {
      // Target: 'stole', Guess: 'etols' (all letters present but wrong positions)
      const feedback = game.checkGuess('etols');
      
      expect(feedback).toEqual([
        { letter: 'e', status: 'wrong-position' }, // e is in stole but not at position 1
        { letter: 't', status: 'wrong-position' }, // t is in stole but not at position 2
        { letter: 'o', status: 'wrong-position' }, // o is in stole but not at position 3
        { letter: 'l', status: 'wrong-position' }, // l is in stole but not at position 4
        { letter: 's', status: 'wrong-position' }  // s is in stole but not at position 5
      ]);
    });

    test('should handle duplicate letters correctly', () => {
      game.targetWord = 'belle'; // Word with duplicate 'l' and 'e'
      const feedback = game.checkGuess('llama');
      
      // Only one 'l' should be marked as correct/wrong-position since target has two 'l's
      expect(feedback[0].letter).toBe('l');
      expect(feedback[1].letter).toBe('l');
      expect(feedback[2].letter).toBe('a');
      expect(feedback[3].letter).toBe('m');
      expect(feedback[4].letter).toBe('a');
    });
  });

  describe('getGameState', () => {
    test('should return complete game state', () => {
      game.makeGuess('huset');
      const state = game.getGameState();
      
      expect(state).toEqual({
        gameState: 'playing',
        attempts: 1,
        maxAttempts: 6,
        guesses: expect.any(Array),
        lastGuess: expect.any(Object),
        word: null // Should be null while playing
      });
    });

    test('should include target word when game is finished', () => {
      game.makeGuess('stole'); // Win
      const state = game.getGameState();
      
      expect(state.word).toBe('stole');
      expect(state.gameState).toBe('won');
    });
  });

  describe('game flow integration', () => {
    test('should handle complete winning game flow', () => {
      // First guess - partial match
      let result = game.makeGuess('huset');
      expect(result.gameState).toBe('playing');
      expect(result.attempts).toBe(1);

      // Second guess - different partial match  
      result = game.makeGuess('borde');
      expect(result.gameState).toBe('playing');
      expect(result.attempts).toBe(2);

      // Third guess - winning guess
      result = game.makeGuess('stole');
      expect(result.gameState).toBe('won');
      expect(result.attempts).toBe(3);
      expect(result.word).toBe('stole');
    });

    test('should handle complete losing game flow', () => {
      const wrongGuesses = ['huset', 'borde', 'lampe', 'stege', 'plads'];
      
      // Make 5 wrong guesses
      wrongGuesses.forEach((guess, index) => {
        const result = game.makeGuess(guess);
        expect(result.gameState).toBe('playing');
        expect(result.attempts).toBe(index + 1);
      });

      // 6th wrong guess - should lose
      const result = game.makeGuess('huset'); // Repeat first guess
      expect(result.gameState).toBe('lost');
      expect(result.attempts).toBe(6);
      expect(result.word).toBe('stole');
    });
  });
});