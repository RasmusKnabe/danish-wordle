const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Frontend UI Tests', () => {
  let dom;
  let window;
  let document;
  let fetchMock;

  beforeEach(() => {
    // Read the HTML file
    const htmlPath = path.join(__dirname, '../../public/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Create JSDOM instance
    dom = new JSDOM(html, {
      url: 'http://localhost:3000',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;

    // Mock fetch API
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    // Mock console methods to avoid test noise
    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };

    // Load the JavaScript file
    const scriptPath = path.join(__dirname, '../../public/script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Evaluate script in JSDOM context
    window.eval(scriptContent);
  });

  afterEach(() => {
    dom.window.close();
    jest.restoreAllMocks();
  });

  describe('DOM Elements', () => {
    test('should have all required elements', () => {
      expect(document.getElementById('gameBoard')).toBeTruthy();
      expect(document.getElementById('keyboard')).toBeTruthy();
      expect(document.getElementById('message')).toBeTruthy();
      expect(document.querySelector('.container')).toBeTruthy();
    });

    test('should create game board with 6 rows and 5 tiles each', () => {
      // Simulate game initialization
      window.initializeGame();
      
      const gameBoard = document.getElementById('gameBoard');
      const rows = gameBoard.querySelectorAll('.game-row');
      
      expect(rows).toHaveLength(6);
      
      rows.forEach(row => {
        const tiles = row.querySelectorAll('.tile');
        expect(tiles).toHaveLength(5);
      });
    });

    test('should create virtual keyboard with all letters', () => {
      window.initializeGame();
      
      const keyboard = document.getElementById('keyboard');
      const keys = keyboard.querySelectorAll('.key');
      
      // Should have 28 keys (26 letters + SEND + SLET)
      expect(keys.length).toBeGreaterThanOrEqual(28);
      
      // Check for specific keys
      const keyTexts = Array.from(keys).map(key => key.textContent);
      expect(keyTexts).toContain('SEND');
      expect(keyTexts).toContain('SLET');
      expect(keyTexts).toContain('A');
      expect(keyTexts).toContain('Z');
    });
  });

  describe('Game Initialization', () => {
    test('should fetch game state on initialization', async () => {
      const mockGameState = {
        success: true,
        data: {
          gameState: 'playing',
          attempts: 0,
          maxAttempts: 6,
          guesses: [],
          lastGuess: null,
          word: null
        }
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGameState)
      });

      await window.startNewGame();

      expect(fetchMock).toHaveBeenCalledWith('/game');
    });

    test('should handle fetch errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await window.startNewGame();

      expect(fetchMock).toHaveBeenCalledWith('/game');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('User Input Handling', () => {
    beforeEach(() => {
      window.initializeGame();
    });

    test('should handle keyboard input', () => {
      const initialRow = window.gameState.currentRow;
      const initialTile = window.gameState.currentTile;

      // Simulate typing 'H'
      const keyEvent = new window.KeyboardEvent('keydown', { key: 'H' });
      document.dispatchEvent(keyEvent);

      // Should add letter to current position
      const currentTile = document.querySelector(
        `.game-row:nth-child(${initialRow + 1}) .tile:nth-child(${initialTile + 1})`
      );
      expect(currentTile.textContent).toBe('H');
    });

    test('should handle backspace', () => {
      // Add a letter first
      window.handleKeyboardInput('H');
      
      // Then backspace
      const backspaceEvent = new window.KeyboardEvent('keydown', { key: 'Backspace' });
      document.dispatchEvent(backspaceEvent);

      const currentTile = document.querySelector('.game-row:first-child .tile:first-child');
      expect(currentTile.textContent).toBe('');
    });

    test('should limit input to 5 letters per row', () => {
      // Type 6 letters
      ['H', 'U', 'S', 'E', 'T', 'X'].forEach(letter => {
        window.handleKeyboardInput(letter);
      });

      const firstRow = document.querySelector('.game-row:first-child');
      const tiles = firstRow.querySelectorAll('.tile');
      
      // Should only have 5 letters
      expect(tiles[4].textContent).toBe('T');
      expect(window.gameState.currentTile).toBe(5); // At max
    });

    test('should handle virtual keyboard clicks', () => {
      window.initializeGame();
      
      const keyA = Array.from(document.querySelectorAll('.key'))
        .find(key => key.textContent === 'A');
      
      keyA.click();
      
      const firstTile = document.querySelector('.game-row:first-child .tile:first-child');
      expect(firstTile.textContent).toBe('A');
    });
  });

  describe('Guess Submission', () => {
    beforeEach(() => {
      window.initializeGame();
      
      // Mock successful API response
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            gameState: 'playing',
            attempts: 1,
            maxAttempts: 6,
            guesses: [{
              word: 'huset',
              feedback: [
                { letter: 'h', status: 'wrong' },
                { letter: 'u', status: 'wrong-position' },
                { letter: 's', status: 'correct' },
                { letter: 'e', status: 'wrong' },
                { letter: 't', status: 'wrong-position' }
              ]
            }],
            lastGuess: {
              word: 'huset',
              feedback: [
                { letter: 'h', status: 'wrong' },
                { letter: 'u', status: 'wrong-position' },
                { letter: 's', status: 'correct' },
                { letter: 'e', status: 'wrong' },
                { letter: 't', status: 'wrong-position' }
              ]
            },
            word: null
          }
        })
      });
    });

    test('should submit guess when Enter is pressed', async () => {
      // Type a word
      'HUSET'.split('').forEach(letter => {
        window.handleKeyboardInput(letter);
      });

      // Press Enter
      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fetchMock).toHaveBeenCalledWith('/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: 'HUSET' })
      });
    });

    test('should not submit incomplete words', () => {
      // Type only 3 letters
      'HUS'.split('').forEach(letter => {
        window.handleKeyboardInput(letter);
      });

      // Try to submit
      const enterEvent = new window.KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('should update board with feedback', async () => {
      // Type word and submit
      'HUSET'.split('').forEach(letter => {
        window.handleKeyboardInput(letter);
      });

      await window.submitGuess();

      // Check that tiles have correct classes
      const firstRow = document.querySelector('.game-row:first-child');
      const tiles = firstRow.querySelectorAll('.tile');

      expect(tiles[0].classList.contains('wrong')).toBe(true);
      expect(tiles[1].classList.contains('wrong-position')).toBe(true);
      expect(tiles[2].classList.contains('correct')).toBe(true);
      expect(tiles[3].classList.contains('wrong')).toBe(true);
      expect(tiles[4].classList.contains('wrong-position')).toBe(true);
    });
  });

  describe('Game State Management', () => {
    test('should handle winning state', async () => {
      window.initializeGame();

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            gameState: 'won',
            attempts: 1,
            maxAttempts: 6,
            word: 'stole'
          }
        })
      });

      // Simulate winning guess
      'STOLE'.split('').forEach(letter => {
        window.handleKeyboardInput(letter);
      });

      await window.submitGuess();

      const message = document.getElementById('message');
      expect(message.textContent).toContain('Tillykke');
    });

    test('should handle losing state', async () => {
      window.initializeGame();

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            gameState: 'lost',
            attempts: 6,
            maxAttempts: 6,
            word: 'stole'
          }
        })
      });

      await window.submitGuess();

      const message = document.getElementById('message');
      expect(message.textContent).toContain('Ordet var');
    });

    test('should disable input after game ends', async () => {
      window.initializeGame();
      window.gameState.gameState = 'won';

      // Try to input after game ends
      window.handleKeyboardInput('A');

      // Should not add letter
      const firstTile = document.querySelector('.game-row:first-child .tile:first-child');
      expect(firstTile.textContent).toBe('');
    });
  });

  describe('Error Handling', () => {
    test('should display error messages', async () => {
      window.initializeGame();

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: 'Ordet skal være 5 bogstaver langt'
        })
      });

      'TEST'.split('').forEach(letter => {
        window.handleKeyboardInput(letter);
      });

      await window.submitGuess();

      const message = document.getElementById('message');
      expect(message.classList.contains('error')).toBe(true);
      expect(message.textContent).toBe('Ordet skal være 5 bogstaver langt');
    });

    test('should handle network errors', async () => {
      window.initializeGame();

      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      'HUSET'.split('').forEach(letter => {
        window.handleKeyboardInput(letter);
      });

      await window.submitGuess();

      expect(console.error).toHaveBeenCalled();
    });
  });
});