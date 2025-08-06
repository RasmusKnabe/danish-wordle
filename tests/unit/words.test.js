const { describe, test, expect, beforeEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Mock fs module for testing
jest.mock('fs');

describe('words.js', () => {
  let words;
  
  beforeEach(() => {
    jest.resetModules();
    // Mock file content
    const mockWordList = 'huset\nstole\nborde\nlampe\nstege\nplads\nefter\naldrig\nmange\nnogen\nandre\nførste\ngamle\nstore\nlille\n';
    fs.readFileSync.mockReturnValue(mockWordList);
    
    // Re-require module after mocking
    words = require('../../words');
  });

  describe('getTodaysWord', () => {
    test('should return a valid 5-letter word', () => {
      const todaysWord = words.getTodaysWord();
      expect(typeof todaysWord).toBe('string');
      expect(todaysWord).toHaveLength(5);
    });

    test('should return consistent word for same day', () => {
      const word1 = words.getTodaysWord();
      const word2 = words.getTodaysWord();
      expect(word1).toBe(word2);
    });

    test('should be deterministic based on date', () => {
      // Mock Date to specific day
      const mockDate = new Date('2025-08-05');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      const todaysWord = words.getTodaysWord();
      expect(todaysWord).toBe('borde'); // Expected word for this date based on algorithm
      
      global.Date.mockRestore();
    });
  });

  describe('isValidWord', () => {
    test('should return true for valid Danish words', () => {
      expect(words.isValidWord('huset')).toBe(true);
      expect(words.isValidWord('stole')).toBe(true);
      expect(words.isValidWord('HUSET')).toBe(true); // Case insensitive
    });

    test('should return false for invalid words', () => {
      expect(words.isValidWord('xxxxx')).toBe(false);
      expect(words.isValidWord('hello')).toBe(false);
      expect(words.isValidWord('')).toBe(false);
    });

    test('should handle different cases correctly', () => {
      expect(words.isValidWord('STOLE')).toBe(true);
      expect(words.isValidWord('Stole')).toBe(true);
      expect(words.isValidWord('StOlE')).toBe(true);
    });

    test('should handle whitespace', () => {
      expect(words.isValidWord(' stole ')).toBe(true);
      expect(words.isValidWord('stole\n')).toBe(true);
    });

    test('should return false for non-string input', () => {
      expect(words.isValidWord(null)).toBe(false);
      expect(words.isValidWord(undefined)).toBe(false);
      expect(words.isValidWord(123)).toBe(false);
      expect(words.isValidWord({})).toBe(false);
    });
  });

  describe('DANISH_WORDS', () => {
    test('should contain expected test words', () => {
      expect(words.DANISH_WORDS).toContain('huset');
      expect(words.DANISH_WORDS).toContain('stole');
      expect(words.DANISH_WORDS).toContain('borde');
    });

    test('should not contain empty strings', () => {
      expect(words.DANISH_WORDS).not.toContain('');
      expect(words.DANISH_WORDS).not.toContain(' ');
    });

    test('should be an array', () => {
      expect(Array.isArray(words.DANISH_WORDS)).toBe(true);
    });
  });

  describe('file loading', () => {
    test('should call fs.readFileSync with correct path', () => {
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('ordliste.txt'),
        'utf8'
      );
    });

    test('should handle file read errors gracefully', () => {
      jest.resetModules();
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => require('../../words')).toThrow('File not found');
    });
  });
});