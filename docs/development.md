# Development Guide

Velkommen som bidragyder til Danish Wordle! Denne guide hjælper dig med at komme i gang med udvikling og bidrag til projektet.

## 🤝 Sådan bidrager du

### 1. Fork og clone

```bash
# Fork repository på GitHub
# Derefter clone din fork
git clone https://github.com/[DIT-USERNAME]/danish-wordle.git
cd danish-wordle

# Tilføj upstream remote
git remote add upstream https://github.com/RasmusKnabe/danish-wordle.git
```

### 2. Development setup

```bash
# Installer dependencies
npm install

# Start development server
npm run dev

# Åbn i browser
open http://localhost:3000
```

### 3. Branch strategi

```bash
# Opret feature branch
git checkout -b feature/beskrivelse-af-feature

# Opret bugfix branch  
git checkout -b bugfix/beskrivelse-af-bug

# Opret hotfix branch
git checkout -b hotfix/kritisk-fix
```

## 📋 Code standards

### JavaScript Style Guide

Vi følger moderne ES6+ standarder:

```javascript
// ✅ God stil
const gameState = {
  currentRow: 0,
  isPlaying: true
};

async function submitGuess(word) {
  try {
    const response = await fetch('/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess: word })
    });
    return await response.json();
  } catch (error) {
    console.error('Guess submission failed:', error);
    throw error;
  }
}

// ❌ Undgå
var gameState = {
  currentRow: 0,
  isPlaying: true
}

function submitGuess(word, callback) {
  var xhr = new XMLHttpRequest();
  // ... XMLHttpRequest kode
}
```

### HTML Conventions

```html
<!-- ✅ Semantisk HTML -->
<header>
  <h1>WORDLE</h1>
</header>

<main>
  <section class="game-board" aria-label="Spille bræt">
    <!-- Game tiles -->
  </section>
  
  <section class="keyboard" aria-label="Virtuelt tastatur">
    <!-- Keyboard buttons -->
  </section>
</main>

<!-- ❌ Undgå non-semantic tags -->
<div class="header">
  <div class="title">WORDLE</div>
</div>
```

### CSS Guidelines

```css
/* ✅ Mobile-first responsive design */
.game-board {
  padding: 20px;
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 5px;
}

@media (max-width: 480px) {
  .game-board {
    padding: 60px;
  }
}

/* ✅ BEM-lignende naming */
.tile {
  /* Base tile styles */
}

.tile--correct {
  background-color: #179C19;
}

.tile--wrong-position {
  background-color: #DB9D29;
}

/* ❌ Undgå !important */
.tile {
  background: red !important; /* Undgå dette */
}
```

### Node.js/Express Conventions

```javascript
// ✅ Error handling
app.post('/guess', async (req, res) => {
  try {
    const { guess } = req.body;
    
    if (!guess || typeof guess !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid guess format'
      });
    }
    
    const game = getGameSession(req, res);
    const result = game.makeGuess(guess);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Guess error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ❌ Undgå ukontrollerede errors
app.post('/guess', (req, res) => {
  const game = getGameSession(req, res);
  const result = game.makeGuess(req.body.guess); // Kan fejle
  res.json({ data: result });
});
```

## 🧪 Testing

Vi har et omfattende test suite med Jest, Supertest og JSDOM.

### Kør Tests

```bash
# Alle tests
npm test

# Specifik test kategori
npm test -- --testPathPattern=tests/unit
npm test -- --testPathPattern=tests/integration  
npm test -- --testPathPattern=tests/frontend

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Struktur

```
tests/
├── unit/               # Unit tests for core logic
│   ├── game.test.js   # WordleGame class tests
│   ├── words.test.js  # Word management tests
│   └── simple-game.test.js # Basic game functionality
├── integration/        # API endpoint tests
│   └── api.test.js    # Express server integration
├── frontend/          # UI and browser tests
│   └── ui.test.js     # DOM interactions and game UI
├── fixtures/          # Test data
│   └── testWords.txt  # Sample word lists
└── README.md          # Detailed test documentation
```

### Test Coverage

- **Unit Tests**: Game logic, word validation, feedback algorithms
- **Integration Tests**: API endpoints, session management, error handling
- **Frontend Tests**: DOM manipulation, user interactions, game flow
- **End-to-End Scenarios**: Complete gameplay from start to finish

### Coverage Goals

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

### Continuous Integration

Tests køre automatisk ved:
- Push til `master` eller `develop` branches
- Pull requests til `master`
- Multiple Node.js versions (16, 18, 20)

Se `.github/workflows/test.yml` for CI konfiguration.

### Writing Tests

```javascript
// Jest test example
describe('WordleGame', () => {
  test('should validate 5-letter words only', () => {
    const game = new WordleGame();
    expect(() => game.makeGuess('test')).toThrow('Word must be exactly 5 letters');
    expect(() => game.makeGuess('tested')).toThrow('Word must be exactly 5 letters');
  });

  test('should win when correct word is guessed', () => {
    const game = new WordleGame();
    const result = game.makeGuess('stole');
    expect(result.gameState).toBe('won');
  });
});
```

### Debugging Tests

```bash
# Specific test file
npm test -- tests/unit/game.test.js

# Single test pattern
npm test -- --testNamePattern="should win"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest tests/unit/game.test.js
```

Se [Test Documentation](../tests/README.md) for detaljerede test guidelines og best practices.

## 🔄 Git Workflow

### Commit meddelelser

Vi bruger konventionelle commit meddelelser:

```bash
# Feature
git commit -m "feat: add virtual keyboard support"

# Bug fix
git commit -m "fix: correct tile color feedback logic"

# Documentation
git commit -m "docs: update installation guide"

# Style changes
git commit -m "style: improve mobile responsive design"

# Refactoring
git commit -m "refactor: simplify game state management"
```

### Pull Request proces

1. **Sync med upstream**
   ```bash
   git fetch upstream
   git checkout master
   git merge upstream/master
   ```

2. **Opret feature branch**
   ```bash
   git checkout -b feature/min-feature
   ```

3. **Udvikling og commits**
   ```bash
   git add .
   git commit -m "feat: beskrivelse af feature"
   ```

4. **Push til din fork**
   ```bash
   git push origin feature/min-feature
   ```

5. **Opret Pull Request på GitHub**
   - Klar beskrivelse af ændringer
   - Screenshots hvis UI ændringer
   - Test instruktioner

### PR Template

```markdown
## Beskrivelse
Kort beskrivelse af hvad denne PR gør.

## Type ændring
- [ ] Bug fix
- [ ] Ny feature
- [ ] Breaking change
- [ ] Documentation opdatering

## Test
- [ ] Jeg har testet mine ændringer
- [ ] Existing tests passed
- [ ] Jeg har tilføjet tests for new functionality

## Screenshots
(Hvis UI ændringer)

## Checklist
- [ ] Min kode følger project style guidelines
- [ ] Jeg har udført self-review af min kode
- [ ] Jeg har kommenteret kode hvor nødvendigt
- [ ] Jeg har opdateret dokumentation
```

## 🐛 Debugging

### Frontend debugging

```javascript
// Console debugging
console.log('Current game state:', gameState);
console.log('API response:', response);

// Browser DevTools
// 1. Åbn DevTools (F12)
// 2. Network tab for API calls
// 3. Console tab for logs
// 4. Elements tab for DOM inspection
```

### Backend debugging

```javascript
// Console logging
console.log('Game session:', req.cookies.wordleSession);
console.log('Guess received:', req.body.guess);
console.error('Error in makeGuess:', error);

// Node.js debugging
// Start server med inspect flag
node --inspect server.js
// Åbn chrome://inspect i Chrome
```

### Common debugging scenarios

```javascript
// 1. API ikke tilgængelig
fetch('/game')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .catch(error => console.error('API Error:', error));

// 2. Session problemer
function debugSession(req) {
  console.log('Session cookie:', req.cookies.wordleSession);
  console.log('Active sessions:', Array.from(gameSessions.keys()));
}
```

## 📁 Projekt struktur

```
danish-wordle/
├── public/              # Frontend static files
│   ├── index.html      # Main page
│   ├── script.js       # Client-side logic
│   └── style.css       # Styling
├── docs/               # Documentation
│   ├── README.md       # Main documentation
│   ├── api-reference.md
│   ├── architecture.md
│   └── ...
├── server.js           # Express server
├── game.js             # WordleGame class
├── words.js            # Word management
├── ordliste.txt        # Danish word database
├── package.json        # Dependencies
├── .gitignore          # Git ignore rules
├── CLAUDE.md           # Claude Code context
└── README.md           # Project overview
```

## 🚀 Release proces

### 1. Version numbers

Vi følger [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features (1.1.0)
- **PATCH**: Bug fixes (1.0.1)

### 2. Release workflow

```bash
# 1. Update version i package.json
npm version patch|minor|major

# 2. Update CHANGELOG.md
# 3. Commit changes
git add .
git commit -m "release: v1.0.1"

# 4. Tag release
git tag v1.0.1

# 5. Push to GitHub
git push origin master --tags

# 6. Deploy to production
./deploy.sh
```

## 💡 Feature requests

### Hvordan foreslå nye features

1. **Check existing issues** på GitHub
2. **Opret new issue** med `enhancement` label
3. **Beskriv use case** og forventet funktionalitet
4. **Diskuter med maintainers** før implementation

### Aktuelle feature ønsker

- [ ] Game statistics (antal spil, win rate)
- [ ] Share funktion for resultater
- [ ] Dark mode
- [ ] Accessibility forbedringer
- [ ] Offline support (PWA)
- [ ] Multiple word lengths (4, 6 bogstaver)

## 📞 Getting Help

- **GitHub Issues**: Tekniske spørgsmål og bug reports
- **Dokumentation**: Se guides i `/docs` folder
- **Code Review**: Be om review i din PR

## 🙏 Tak for dit bidrag!

Hvert bidrag, uanset størrelse, hjælper med at gøre Danish Wordle bedre for alle!

---

*Happy coding! 🚀*