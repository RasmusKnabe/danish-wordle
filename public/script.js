class WordleGame {
    constructor() {
        this.currentRow = 0;
        this.currentTile = 0;
        this.gameState = 'playing';
        this.guesses = [];
        this.currentGuess = '';
        this.maxGuesses = 6;
        
        this.gameBoard = document.querySelector('.game-board');
        this.message = document.getElementById('message');
        this.keyboard = document.querySelector('.keyboard');
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadGameState();
    }

    initializeGame() {
        // Create game grid
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.classList.add('game-row');
            row.setAttribute('data-row', i);
            
            for (let j = 0; j < 5; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.setAttribute('data-row', i);
                tile.setAttribute('data-col', j);
                row.appendChild(tile);
            }
            
            this.gameBoard.appendChild(row);
        }
    }

    setupEventListeners() {
        // Keyboard clicks
        this.keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                if (e.target.id === 'enter-key') {
                    this.submitGuess();
                } else if (e.target.id === 'backspace-key') {
                    this.deleteLetter();
                } else {
                    const letter = e.target.getAttribute('data-key');
                    if (letter) {
                        this.addLetter(letter);
                    }
                }
            }
        });

        // Physical keyboard
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            const key = e.key.toLowerCase();
            
            if (key === 'enter') {
                this.submitGuess();
            } else if (key === 'backspace') {
                this.deleteLetter();
            } else if (/^[a-zæøå]$/.test(key)) {
                this.addLetter(key);
            }
        });
    }

    async loadGameState() {
        try {
            const response = await fetch('/game');
            const data = await response.json();
            
            if (data.success) {
                this.updateGameFromState(data.data);
            } else {
                this.showMessage('Fejl ved indlæsning af spil', 'error');
            }
        } catch (error) {
            this.showMessage('Kunne ikke forbinde til server', 'error');
        }
    }

    updateGameFromState(gameData) {
        this.gameState = gameData.gameState;
        this.guesses = gameData.guesses;
        this.currentRow = gameData.attempts;
        
        // Render previous guesses
        gameData.guesses.forEach((guess, rowIndex) => {
            this.renderGuess(guess.word, guess.feedback || guess.result, rowIndex);
            this.updateKeyboardColors(guess.word, guess.feedback || guess.result);
        });
        
        // Show game status
        if (this.gameState === 'won') {
            this.showMessage('Tillykke! Du gættede ordet!', 'success');
        } else if (this.gameState === 'lost') {
            this.showMessage(`Spillet er slut. Ordet var: ${gameData.word.toUpperCase()}`, 'error');
        } else {
            this.showMessage(`Gæt dagens ord (${this.currentRow + 1}/${this.maxGuesses})`, 'info');
        }
    }

    addLetter(letter) {
        if (this.gameState !== 'playing') return;
        if (this.currentTile >= 5) return;
        
        const tile = document.querySelector(`[data-row="${this.currentRow}"][data-col="${this.currentTile}"]`);
        tile.textContent = letter.toUpperCase();
        tile.classList.add('filled');
        
        this.currentGuess += letter;
        this.currentTile++;
    }

    deleteLetter() {
        if (this.gameState !== 'playing') return;
        if (this.currentTile === 0) return;
        
        this.currentTile--;
        const tile = document.querySelector(`[data-row="${this.currentRow}"][data-col="${this.currentTile}"]`);
        tile.textContent = '';
        tile.classList.remove('filled');
        
        this.currentGuess = this.currentGuess.slice(0, -1);
    }

    async submitGuess() {
        if (this.gameState !== 'playing') return;
        if (this.currentGuess.length !== 5) {
            this.showMessage('Ordet skal være på 5 bogstaver', 'error');
            return;
        }

        try {
            const response = await fetch('/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word: this.currentGuess })
            });

            const data = await response.json();

            if (data.success) {
                const result = data.data;
                
                // Render the guess
                this.renderGuess(this.currentGuess, result.lastGuess.feedback || result.lastGuess.result, this.currentRow);
                this.updateKeyboardColors(this.currentGuess, result.lastGuess.feedback || result.lastGuess.result);
                
                // Update game state
                this.gameState = result.gameState;
                this.currentRow++;
                this.currentTile = 0;
                this.currentGuess = '';
                
                // Show result message
                if (result.gameState === 'won') {
                    this.showMessage('Tillykke! Du gættede ordet!', 'success');
                } else if (result.gameState === 'lost') {
                    this.showMessage(`Spillet er slut. Ordet var: ${result.word.toUpperCase()}`, 'error');
                } else {
                    this.showMessage(`Gæt ${result.attempts + 1}/${result.maxAttempts}`, 'info');
                }
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Kunne ikke forbinde til server', 'error');
        }
    }

    renderGuess(word, result, rowIndex) {
        for (let i = 0; i < 5; i++) {
            const tile = document.querySelector(`[data-row="${rowIndex}"][data-col="${i}"]`);
            tile.textContent = word[i].toUpperCase();
            tile.classList.add('filled');
            
            // Add result class with animation delay
            setTimeout(() => {
                const status = result[i].status || result[i];
                tile.classList.add(typeof status === 'string' ? status.replace('_', '-') : status);
            }, i * 100);
        }
    }

    updateKeyboardColors(word, result) {
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            const keyElement = document.querySelector(`[data-key="${letter}"]`);
            
            if (keyElement) {
                const status = result[i].status || result[i];
                const currentClass = typeof status === 'string' ? status.replace('_', '-') : status;
                
                // Only update if it's a better result (correct > wrong-position > wrong)
                if (currentClass === 'correct' || 
                    (currentClass === 'wrong-position' && !keyElement.classList.contains('correct')) ||
                    (currentClass === 'wrong' && !keyElement.classList.contains('correct') && !keyElement.classList.contains('wrong-position'))) {
                    
                    keyElement.classList.remove('correct', 'wrong-position', 'wrong');
                    keyElement.classList.add(currentClass);
                }
            }
        }
    }

    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = `message ${type}`;
        
        if (type === 'error') {
            setTimeout(() => {
                if (this.gameState === 'playing') {
                    this.message.textContent = `Gæt ${this.currentRow + 1}/${this.maxGuesses}`;
                    this.message.className = 'message info';
                }
            }, 3000);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordleGame();
});