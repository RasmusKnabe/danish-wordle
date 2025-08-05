const { getTodaysWord, isValidWord } = require('./words');

class WordleGame {
  constructor() {
    this.targetWord = getTodaysWord();
    this.guesses = [];
    this.maxGuesses = 6;
    this.gameState = 'playing'; // 'playing', 'won', 'lost'
  }

  makeGuess(word) {
    // If game is finished, return current state instead of throwing error
    if (this.gameState !== 'playing') {
      return this.getGameState();
    }

    word = word.toLowerCase().trim();

    if (word.length !== 5) {
      throw new Error('Word must be exactly 5 letters');
    }

    if (!isValidWord(word)) {
      throw new Error('Not a valid Danish word');
    }

    const result = this.checkGuess(word);
    this.guesses.push({ word, result });

    // Check win condition
    if (word === this.targetWord) {
      this.gameState = 'won';
    } else if (this.guesses.length >= this.maxGuesses) {
      this.gameState = 'lost';
    }

    return {
      gameState: this.gameState,
      attempts: this.guesses.length,
      maxAttempts: this.maxGuesses,
      guesses: this.guesses,
      lastGuess: { word, result },
      word: this.gameState === 'lost' ? this.targetWord : null
    };
  }

  checkGuess(word) {
    const result = [];
    const targetLetters = this.targetWord.split('');
    const guessLetters = word.split('');

    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = 'correct';
        targetLetters[i] = null; // Mark as used
        guessLetters[i] = null; // Mark as processed
      }
    }

    // Second pass: mark wrong positions and wrong letters
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] !== null) {
        const letterIndex = targetLetters.indexOf(guessLetters[i]);
        if (letterIndex !== -1) {
          result[i] = 'wrong_position';
          targetLetters[letterIndex] = null; // Mark as used
        } else {
          result[i] = 'wrong';
        }
      }
    }

    return result;
  }

  getGameState() {
    const lastGuess = this.guesses.length > 0 ? this.guesses[this.guesses.length - 1] : null;
    
    return {
      gameState: this.gameState,
      attempts: this.guesses.length,
      maxAttempts: this.maxGuesses,
      guesses: this.guesses,
      lastGuess,
      word: this.gameState === 'lost' ? this.targetWord : null
    };
  }
}

module.exports = WordleGame;