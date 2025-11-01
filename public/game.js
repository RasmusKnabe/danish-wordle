class WordleGameUI {
    constructor() {
        this.currentRow = 0;
        this.currentCol = 0;
        this.maxRows = 6;
        this.maxCols = 5;
        this.gameCompleted = false;
        
        this.loadGameState();
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        // Disable alle rækker undtagen den første (eller nuværende hvis loaded)
        this.updateRowStates();
        
        // Set focus på første input felt hvis spillet ikke er færdigt
        if (!this.gameCompleted) {
            this.focusCurrentCell();
        }
    }
    
    saveGameState() {
        const gameState = {
            currentRow: this.currentRow,
            currentCol: this.currentCol,
            gameCompleted: this.gameCompleted,
            guesses: [],
            timestamp: Date.now()
        };
        
        // Gem alle gæt og deres feedback + nuværende delvis input
        const rows = document.querySelectorAll('.game-board-row');
        rows.forEach((row, rowIndex) => {
            if (rowIndex < this.currentRow || (rowIndex === this.currentRow && this.gameCompleted)) {
                // Submittet række med feedback
                const inputs = row.querySelectorAll('.tile');
                const guess = {
                    word: Array.from(inputs).map(input => input.textContent || '').join(''),
                    feedback: []
                };
                
                inputs.forEach(input => {
                    let status = 'absent'; // default
                    if (input.classList.contains('correct')) status = 'correct';
                    else if (input.classList.contains('present')) status = 'present';
                    else if (input.classList.contains('absent')) status = 'absent';
                    
                    guess.feedback.push({
                        letter: input.textContent || '',
                        status: status
                    });
                });
                
                gameState.guesses.push(guess);
            } else if (rowIndex === this.currentRow && !this.gameCompleted) {
                // Nuværende række med delvis input (uden feedback)
                const inputs = row.querySelectorAll('.tile');
                const currentInput = Array.from(inputs).map(input => input.textContent || '').join('');
                if (currentInput.trim() !== '') {
                    const guess = {
                        word: currentInput,
                        feedback: [],
                        partial: true // Markér som delvis input
                    };
                    
                    inputs.forEach(input => {
                        guess.feedback.push({
                            letter: input.textContent || '',
                            status: 'none' // Ingen feedback endnu
                        });
                    });
                    
                    gameState.guesses.push(guess);
                }
            }
        });
        
        localStorage.setItem('wordle-game-state', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('wordle-game-state');
        if (!savedState) return;
        
        try {
            const gameState = JSON.parse(savedState);
            
            // Tjek om det er fra i dag (simpel check)
            const now = Date.now();
            const dayInMs = 24 * 60 * 60 * 1000;
            if (now - gameState.timestamp > dayInMs) {
                // Gammel state - clear den
                localStorage.removeItem('wordle-game-state');
                return;
            }
            
            this.currentRow = gameState.currentRow;
            this.currentCol = gameState.currentCol;
            this.gameCompleted = gameState.gameCompleted;
            
            // Gendan alle gæt
            setTimeout(() => {
                this.restoreGuesses(gameState.guesses);
            }, 100);
            
        } catch (error) {
            console.error('Error loading game state:', error);
            localStorage.removeItem('wordle-game-state');
        }
    }
    
    restoreGuesses(guesses) {
        const rows = document.querySelectorAll('.game-board-row');
        
        guesses.forEach((guess, rowIndex) => {
            const row = rows[rowIndex];
            const inputs = row.querySelectorAll('.tile');
            
            inputs.forEach((input, colIndex) => {
                const feedback = guess.feedback[colIndex];
                input.textContent = feedback.letter;
                
                // Tilføj farve feedback kun hvis ikke partial input
                if (!guess.partial && feedback.status !== 'none') {
                    input.classList.remove('correct', 'present', 'absent');
                    input.classList.add(feedback.status);
                    
                    // Opdater keyboard
                    this.updateKeyboardColor(feedback.letter, feedback.status);
                }
            });
        });
        
        // Gendan nuværende række hvis der er delvis input
        if (!this.gameCompleted && this.currentRow < this.maxRows) {
            this.restoreCurrentRowInput();
        }
        
        // Opdater row states
        this.updateRowStates();
    }
    
    restoreCurrentRowInput() {
        // Prøv at gendanne delvis input i nuværende række
        const rows = document.querySelectorAll('.game-board-row');
        const currentRowElement = rows[this.currentRow];
        const inputs = currentRowElement.querySelectorAll('.tile');
        
        // Find den sidste udfyldte position
        let lastFilledIndex = -1;
        inputs.forEach((input, index) => {
            if (input.textContent && input.textContent.trim() !== '') {
                lastFilledIndex = index;
            }
        });
        
        // Sæt currentCol til næste ledige position
        this.currentCol = Math.min(lastFilledIndex + 1, this.maxCols - 1);
    }
    
    updateRowStates() {
        const rows = document.querySelectorAll('.game-board-row');
        
        rows.forEach((row, rowIndex) => {
            const inputs = row.querySelectorAll('.tile');
            
            inputs.forEach((input, colIndex) => {
                if (rowIndex === this.currentRow && !this.gameCompleted) {
                    // Aktiv række - enable tiles
                    input.classList.remove('disabled', 'read-only');
                    input.classList.add('active-row');
                    input.setAttribute('tabindex', '0');
                } else if (rowIndex < this.currentRow) {
                    // Submittet række - readonly men ikke disabled
                    input.classList.remove('disabled');
                    input.classList.add('read-only');
                    input.classList.remove('active-row');
                    input.setAttribute('tabindex', '-1');
                } else {
                    // Fremtidige rækker - disable tiles
                    input.classList.add('disabled', 'read-only');
                    input.classList.remove('active-row');
                    input.setAttribute('tabindex', '-1');
                }
            });
        });
    }
    
    getCurrentInput() {
        const rows = document.querySelectorAll('.game-board-row');
        const currentRowElement = rows[this.currentRow];
        const inputs = currentRowElement.querySelectorAll('.tile');
        return inputs[this.currentCol];
    }
    
    focusCurrentCell() {
        const input = this.getCurrentInput();
        if (input && !input.classList.contains('disabled')) {
            input.focus();
        }
    }
    
    moveToNextCell() {
        if (this.currentCol < this.maxCols - 1) {
            this.currentCol++;
            this.focusCurrentCell();
        }
    }
    
    moveToPreviousCell() {
        if (this.currentCol > 0) {
            this.currentCol--;
            this.focusCurrentCell();
        }
    }
    
    moveToNextRow() {
        if (this.currentRow < this.maxRows - 1) {
            this.currentRow++;
            this.currentCol = 0;
            this.updateRowStates();
            this.focusCurrentCell();
        }
    }
    
    setupEventListeners() {
        // Event listener for alle input felter
        document.querySelectorAll('.tile').forEach((input, index) => {
            // Input event - begræns til ét bogstav og hop videre
            input.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase();
                
                // Begræns til ét tegn og kun bogstaver
                if (value.length > 1) {
                    e.target.value = value.charAt(value.length - 1);
                } else if (value && /^[A-ZÆØÅ]$/.test(value)) {
                    e.target.value = value;
                    // Auto-advance til næste felt
                    this.moveToNextCell();
                } else if (value && !/^[A-ZÆØÅ]$/.test(value)) {
                    // Fjern ugyldige tegn
                    e.target.value = '';
                }
            });
            
            // Keydown event - håndter navigation
            input.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        this.moveToNextCell();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.moveToPreviousCell();
                        break;
                    case 'Backspace':
                        // Hvis feltet er tomt, gå til forrige felt
                        if (e.target.value === '') {
                            e.preventDefault();
                            this.moveToPreviousCell();
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.submitRow();
                        break;
                }
            });
            
            // Click event - opdater currentCol når der klikkes
            input.addEventListener('click', (e) => {
                if (!e.target.disabled) {
                    // Find hvilken kolonne der blev klikket på
                    const row = e.target.closest('.game-board-row');
                    const inputs = row.querySelectorAll('.tile');
                    const clickedIndex = Array.from(inputs).indexOf(e.target);
                    
                    // Find hvilken række der blev klikket på
                    const rows = document.querySelectorAll('.game-board-row');
                    const rowIndex = Array.from(rows).indexOf(row);
                    
                    // Opdater kun hvis det er den aktive række
                    if (rowIndex === this.currentRow) {
                        this.currentCol = clickedIndex;
                    }
                }
            });
        });
        
        // Keyboard event listeners
        this.setupKeyboardListeners();
    }
    
    setupKeyboardListeners() {
        // Event listeners for de virtuelle taster
        document.querySelectorAll('.key[data-key]').forEach(key => {
            key.addEventListener('click', (e) => {
                const letter = e.target.getAttribute('data-key').toUpperCase();
                this.addLetter(letter);
            });
        });
        
        // Enter og backspace knapper
        document.getElementById('enter-key')?.addEventListener('click', () => {
            this.submitRow();
        });
        
        document.getElementById('backspace-key')?.addEventListener('click', () => {
            this.deleteLetter();
        });
    }
    
    addLetter(letter) {
        const currentInput = this.getCurrentInput();
        if (currentInput && !currentInput.classList.contains('disabled')) {
            currentInput.textContent = letter;
            this.moveToNextCell();
        }
    }
    
    deleteLetter() {
        const currentInput = this.getCurrentInput();
        if (currentInput && currentInput.textContent !== '') {
            currentInput.textContent = '';
        } else {
            // Hvis nuværende felt er tomt, gå til forrige og slet
            this.moveToPreviousCell();
            const prevInput = this.getCurrentInput();
            if (prevInput) {
                prevInput.textContent = '';
            }
        }
    }
    
    async submitRow() {
        // Tjek om spillet allerede er færdigt
        if (this.gameCompleted) {
            return;
        }
        
        // Tjek om alle felter i nuværende række er udfyldt
        const rows = document.querySelectorAll('.game-board-row');
        const currentRowElement = rows[this.currentRow];
        const inputs = currentRowElement.querySelectorAll('.tile');
        
        const word = Array.from(inputs).map(input => input.textContent || '').join('');
        
        if (word.length === this.maxCols) {
            console.log('Submitted word:', word);
            
            try {
                // Send ordet til backend
                const response = await fetch('/guess', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ word: word.toLowerCase() })
                });
                
                if (response.ok) {
                    const response_data = await response.json();
                    const result = response_data.data || response_data;
                    
                    console.log('Backend response:', result); // Debug log
                    
                    // Ordet er gyldigt - vis animationer og feedback
                    const feedback = result.lastGuess?.result || result.lastGuess?.feedback;
                    if (result.lastGuess && feedback) {
                        await this.showFeedback(inputs, feedback);
                        
                        console.log('Game state:', result.gameState); // Debug log
                        
                        // Gem game state efter hvert gæt
                        this.saveGameState();
                        
                        // Debug: vis feedback array
                        console.log('Feedback array:', feedback);
                        
                        // Tjek om spillet er slut
                        if (result.gameState === 'won') {
                            console.log('Game won! Starting celebration...'); // Debug log
                            this.gameCompleted = true;
                            this.saveGameState();
                            await this.gameWon();
                        } else if (result.gameState === 'lost') {
                            this.gameCompleted = true;
                            this.saveGameState();
                            this.gameLost(result.word);
                        } else {
                            console.log('Moving to next row...'); // Debug log
                            this.moveToNextRow();
                        }
                    }
                } else {
                    // Server returnerede fejl - ordet er ikke gyldigt
                    this.shakeRow(currentRowElement);
                }
                
            } catch (error) {
                console.error('Fejl ved kommunikation med server:', error);
                this.shakeRow(currentRowElement);
            }
        } else {
            console.log('Please fill all fields before submitting');
        }
    }
    
    shakeRow(rowElement) {
        rowElement.classList.add('shake');
        setTimeout(() => {
            rowElement.classList.remove('shake');
        }, 500);
    }
    
    async showFeedback(inputs, feedback) {
        // Tilføj flip animation med delay for hver tile
        const flipPromises = [];
        
        inputs.forEach((input, index) => {
            const promise = new Promise((resolve) => {
                setTimeout(() => {
                    input.classList.add('flip');
                    
                    // Tilføj farve feedback ved midten af flip animation
                    setTimeout(() => {
                        let status = feedback[index].status;
                        // Map backend status til frontend CSS classes
                        if (status === 'wrong') status = 'absent';
                        if (status === 'wrong-position') status = 'present';
                        if (status === 'correct') status = 'correct';
                        
                        input.classList.add(status);
                        
                        // Opdater keyboard farver
                        this.updateKeyboardColor(input.value, status);
                        
                        resolve();
                    }, 300); // Midten af flip animation
                    
                    // Fjern flip class efter animation
                    setTimeout(() => {
                        input.classList.remove('flip');
                    }, 600);
                }, index * 100); // Delay mellem hver tile
            });
            
            flipPromises.push(promise);
        });
        
        // Vent på at alle animationer er færdige
        await Promise.all(flipPromises);
    }
    
    updateKeyboardColor(letter, status) {
        const keyElement = document.querySelector(`[data-key="${letter.toLowerCase()}"]`);
        if (keyElement) {
            // Fjern eksisterende status classes
            keyElement.classList.remove('correct', 'present', 'absent');
            
            // Tilføj ny status, men kun hvis det er en "bedre" status
            const currentClasses = keyElement.classList;
            const hasCorrect = currentClasses.contains('correct');
            const hasPresent = currentClasses.contains('present');
            
            if (status === 'correct' || 
                (status === 'present' && !hasCorrect) || 
                (status === 'absent' && !hasCorrect && !hasPresent)) {
                keyElement.classList.add(status);
            }
        }
    }
    
    async gameWon() {
        // Start bounce animation efter flip er færdig
        await this.showBounceAnimation();
        
        // Game won - no more input needed
        console.log('Game completed successfully!');
    }
    
    async showBounceAnimation() {
        const rows = document.querySelectorAll('.game-board-row');
        const currentRowElement = rows[this.currentRow];
        const inputs = currentRowElement.querySelectorAll('.tile');
        
        // Start bounce animation med delay mellem hver tile
        const bouncePromises = [];
        
        inputs.forEach((input, index) => {
            const promise = new Promise((resolve) => {
                setTimeout(() => {
                    input.classList.add('bounce');
                    
                    // Fjern bounce class efter animation
                    setTimeout(() => {
                        input.classList.remove('bounce');
                        resolve();
                    }, 600); // Match animation duration
                }, index * 100); // 100ms delay mellem hver tile
            });
            
            bouncePromises.push(promise);
        });
        
        // Vent på at alle bounce animationer er færdige
        await Promise.all(bouncePromises);
    }
    
    gameLost(correctWord) {
        // Game lost - show correct word in console
        console.log(`Game over. The correct word was: ${correctWord.toUpperCase()}`);
    }
}

// Start spillet når siden er loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordleGameUI();
});