# Architecture Guide

Denne guide beskriver den tekniske arkitektur og design af Danish Wordle applikationen.

## 🏗️ System oversigt

Danish Wordle er bygget som en klassisk client-server applikation med følgende komponenter:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Web Browser   │◄──►│  Apache Server  │◄──►│  Node.js App    │
│   (Frontend)    │    │  (Reverse Proxy)│    │   (Backend)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   SSL/HTTPS     │    │   Game Logic    │
│  (HTML/CSS/JS)  │    │   Let's Encrypt │    │  Session Store  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Frontend arkitektur

### Teknologier

- **HTML5**: Semantisk markup
- **CSS3**: Responsive design med Grid og Flexbox
- **Vanilla JavaScript**: Ingen frameworks - ren ES6+

### Fil struktur

```
public/
├── index.html      # Main HTML document
├── script.js       # Game logic og API kommunikation
└── style.css       # Styling og responsive design
```

### Frontend komponenter

#### 1. HTML struktur (`index.html`)

```html
<!DOCTYPE html>
<html lang="da">
<head>
    <!-- Meta tags, title, CSS -->
</head>
<body>
    <div class="container">
        <header>
            <h1>WORDLE</h1>
        </header>
        
        <div class="message" id="message"></div>
        
        <div class="game-board" id="gameBoard">
            <!-- 6x5 grid genereres dynamisk -->
        </div>
        
        <div class="keyboard" id="keyboard">
            <!-- Virtuelt keyboard genereres dynamisk -->
        </div>
        
        <footer>
            <!-- Credits og links -->
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

#### 2. CSS arkitektur (`style.css`)

```css
/* Global reset og base styles */
* { box-sizing: border-box; }

/* Layout containers */
.container { /* Flexbox centering */ }
.game-board { /* CSS Grid 6x5 */ }
.keyboard { /* Flexbox keyboard layout */ }

/* Component styles */
.tile { /* Game tile styling */ }
.key { /* Keyboard key styling */ }

/* State classes */
.tile.correct { /* Green - correct position */ }
.tile.wrong-position { /* Yellow - wrong position */ }
.tile.wrong { /* Gray - not in word */ }

/* Responsive design */
@media (max-width: 480px) { /* Mobile optimizations */ }
@media (max-width: 375px) { /* Small phone optimizations */ }
```

#### 3. JavaScript arkitektur (`script.js`)

```javascript
// Global state
let gameState = {
    currentRow: 0,
    currentTile: 0,
    gameBoard: [],
    keyboard: new Map()
};

// Core functions
async function startNewGame() { /* API call + UI reset */ }
async function submitGuess() { /* Validate + API call */ }
function updateBoard(guessData) { /* Update game grid */ }
function updateKeyboard(feedback) { /* Update virtual keyboard */ }

// UI handlers
function handleKeyboardInput(key) { /* Physical keyboard */ }
function handleVirtualKeyboard(key) { /* Virtual keyboard clicks */ }

// Initialization
document.addEventListener('DOMContentLoaded', initializeGame);
```

## ⚙️ Backend arkitektur

### Teknologier

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **UUID**: Session generation
- **Cookie-parser**: Session management

### Fil struktur

```
├── server.js       # Express server og routing
├── game.js         # WordleGame class - core game logic
├── words.js        # Word management og validation
├── ordliste.txt    # Danish word database (8000+ words)
└── package.json    # Dependencies og scripts
```

### Backend komponenter

#### 1. Express Server (`server.js`)

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const WordleGame = require('./game');

const app = express();
const gameSessions = new Map(); // In-memory session storage

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.get('/game', handleGetGame);
app.post('/guess', handlePostGuess);
app.get('/health', handleHealthCheck);

// Session management
function getGameSession(req, res) {
    // UUID-based session creation/retrieval
}
```

#### 2. Game Logic (`game.js`)

```javascript
class WordleGame {
    constructor() {
        this.targetWord = getTodaysWord();
        this.guesses = [];
        this.maxGuesses = 6;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
    }

    makeGuess(word) {
        // Input validation
        // Word checking logic
        // State updates
        return this.getGameState();
    }

    checkGuess(word) {
        // Letter-by-letter comparison
        // Returns feedback array with positions/status
    }
}
```

#### 3. Word Management (`words.js`)

```javascript
// Load Danish words from file
const DANISH_WORDS = fs.readFileSync('ordliste.txt', 'utf8')
    .split('\n')
    .map(word => word.trim())
    .filter(word => word.length > 0);

// Daily word selection
function getTodaysWord() {
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return DANISH_WORDS[dayOfYear % DANISH_WORDS.length];
}

// Word validation
function isValidWord(word) {
    return DANISH_WORDS.includes(word.toLowerCase());
}
```

## 🔄 Data flow

### 1. Game initialization

```
Browser → GET /game → Server
                   ← Game state (JSON)
```

### 2. Guess submission

```
Browser → POST /guess {"guess": "HUSET"} → Server
                                        ← Feedback + Updated state
```

### 3. Session management

```
1. Browser visits site
2. Server generates UUID session
3. Cookie stored in browser
4. Subsequent requests include cookie
5. Server maintains game state per session
```

## 🗃️ Data strukturer

### Game State (JSON)

```json
{
  "success": true,
  "data": {
    "gameState": "playing",
    "attempts": 2,
    "maxAttempts": 6,
    "guesses": [
      {
        "word": "HUSET",
        "feedback": [
          {"letter": "H", "status": "wrong"},
          {"letter": "U", "status": "wrong-position"},
          {"letter": "S", "status": "correct"},
          {"letter": "E", "status": "wrong"},
          {"letter": "T", "status": "wrong-position"}
        ]
      }
    ],
    "lastGuess": { /* samme struktur */ },
    "word": null // kun vist ved spil slut
  }
}
```

### Session Storage

```javascript
// In-memory Map struktur
gameSessions = Map {
  "uuid-session-1" => WordleGame {
    targetWord: "stole",
    guesses: [...],
    gameState: "playing"
  },
  "uuid-session-2" => WordleGame { /* ... */ }
}
```

## 🌐 Deployment arkitektur

### Production Environment

```
Internet → Cloudflare/DNS → Apache (Port 80/443)
                         ↓
                         Reverse Proxy
                         ↓
                         Node.js App (Port 3000)
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName wordle.rasmusknabe.dk
    DocumentRoot /path/to/wordle/public
    
    # Static files served directly by Apache
    <Directory "/path/to/wordle/public">
        AllowOverride All
        Require all granted
    </Directory>

    # API requests proxied to Node.js
    ProxyPass /game http://localhost:3000/game
    ProxyPass /guess http://localhost:3000/guess
    ProxyPass /health http://localhost:3000/health
</VirtualHost>
```

## 🔒 Security considerations

### 1. Session Security

- UUID v4 for session IDs (cryptographically random)
- HttpOnly cookies (protection mod XSS)
- Session timeout ved midnight

### 2. Input Validation

- Backend validerer word length (5 chars)
- Word existence check mod Danish dictionary
- JSON input sanitization

### 3. Rate Limiting

- Implicit rate limiting via session-based game state
- Maximum 6 guesses per game
- Daily word rotation

## 📱 Responsive Design

### Breakpoints

```css
/* Desktop first approach */
.game-board { padding: 60px; }

/* Tablets og små laptops */
@media (max-width: 480px) {
    .game-board { padding: 60px; }
    .tile { width: 45px; height: 45px; }
}

/* Mobile phones */
@media (max-width: 375px) {
    .game-board { padding: 60px; }
    .tile { width: 40px; height: 40px; }
}
```

### Mobile Optimizations

- Touch-friendly button sizes (min 44px)
- Reduced padding på små skærme
- Smaller font sizes
- Optimized keyboard layout

## 🚀 Performance

### Frontend

- Minimal JavaScript bundle (< 10KB)
- CSS Grid for efficient layouts
- No external dependencies
- Optimized for mobile devices

### Backend

- In-memory session storage (fast)
- File-based word list (loaded at startup)
- Efficient word lookup algorithms
- Minimal API endpoints

### Caching Strategy

- Static files cached by Apache
- API responses not cached (session-specific)
- Browser cache for static assets

## 🔮 Skalering muligheder

### Nuværende begrænsninger

- In-memory sessions (ikke persistent)
- Single server deployment
- No database

### Fremtidige forbedringer

- Redis for session storage
- Database for game statistics
- Load balancer for multiple servers
- CDN for static assets
- WebSocket for real-time features

---

*Architecture dokumentation sidst opdateret: 5. august 2025*