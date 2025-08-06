# Installation Guide

Denne guide viser dig hvordan du sætter Danish Wordle op til lokal udvikling.

## 📋 Forudsætninger

Før du starter, skal du have følgende installeret:

- **Node.js** (version 16.0.0 eller nyere)
- **npm** (normalt inkluderet med Node.js)
- **Git** (til at clone repository)

### Verificer installation

```bash
# Check Node.js version
node --version
# Forventet output: v16.0.0 eller nyere

# Check npm version
npm --version
# Forventet output: 7.0.0 eller nyere

# Check Git version
git --version
# Forventet output: git version 2.x.x
```

## 🚀 Lokal installation

### 1. Clone repository

```bash
git clone https://github.com/RasmusKnabe/danish-wordle.git
cd danish-wordle
```

### 2. Installer dependencies

```bash
npm install
```

Dette vil installere alle nødvendige pakker defineret i `package.json`:

- **express**: Web application framework
- **cookie-parser**: Cookie parsing middleware
- **uuid**: UUID generation for sessions

### 3. Start development server

```bash
# Development mode med auto-reload
npm run dev

# Eller standard start
npm start
```

### 4. Åbn i browser

Gå til [http://localhost:3000](http://localhost:3000) for at se spillet.

## 📁 Projekt struktur

Efter installation vil din projektmappe se sådan ud:

```
danish-wordle/
├── public/              # Frontend filer
│   ├── index.html      # Hovedside
│   ├── script.js       # Game logic
│   └── style.css       # Styling
├── docs/               # Dokumentation
├── node_modules/       # Dependencies (genereret)
├── server.js          # Express server
├── game.js            # Game logic backend
├── words.js           # Word management
├── ordliste.txt       # Danish word list
├── package.json       # Project configuration
├── package-lock.json  # Dependency lock file
└── README.md          # Projekt readme
```

## ⚙️ Konfiguration

### Environment Variables

Du kan konfigurere serveren med følgende environment variables:

```bash
# Port nummer (default: 3000)
PORT=3000

# Environment (development/production)
NODE_ENV=development
```

### Eksempel .env fil

Opret en `.env` fil i root directory:

```env
PORT=3000
NODE_ENV=development
```

**Bemærk**: `.env` filer er ikke inkluderet i Git repository af sikkerhedsårsager.

## 🔧 Development værktøjer

### Nodemon

Development server bruger nodemon til automatisk genstart ved kode ændringer:

```bash
npm run dev
```

### Debugging

For at køre server i debug mode:

```bash
node --inspect server.js
```

Åbn Chrome DevTools på `chrome://inspect` for at debugge.

## 🧪 Test setup

Projektet har endnu ikke automatiserede tests, men du kan manuelt teste:

### Backend API

Test API endpoints med curl:

```bash
# Start nyt spil
curl -X GET http://localhost:3000/game

# Indgiv gæt
curl -X POST http://localhost:3000/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"HUSET"}'

# Health check
curl -X GET http://localhost:3000/health
```

### Frontend

1. Åbn [http://localhost:3000](http://localhost:3000)
2. Test game funktionalitet:
   - Indtast 5-bogstav ord
   - Verificer farve feedback
   - Test win/lose scenarier

## 📱 Mobile development

Testen på mobile enheder under udvikling:

### Lokal netværk adgang

Find din computers IP adresse:

```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

Derefter kan mobile enheder på samme netværk tilgå:
`http://[DIN-IP-ADRESSE]:3000`

## ❌ Almindelige problemer

### Port allerede i brug

```bash
Error: listen EADDRINUSE :::3000
```

**Løsning**: Skift port eller stop processer på port 3000:

```bash
# Find proces på port 3000
lsof -i :3000

# Stop proces (erstat PID)
kill -9 [PID]

# Eller brug anden port
PORT=3001 npm start
```

### Node version problemer

```bash
Error: Node.js version too old
```

**Løsning**: Opdater Node.js til version 16+ via [nodejs.org](https://nodejs.org)

### Dependency fejl

```bash
npm ERR! peer dep missing
```

**Løsning**: Slet node_modules og reinstaller:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Næste trin

Nu hvor du har projektet kørende lokalt:

1. Læs [Architecture Guide](architecture.md) for at forstå kodebase
2. Se [API Reference](api-reference.md) for backend detaljer
3. Check [Development Guide](development.md) for bidrag guidelines

## 💡 Tips til udvikling

- Brug browser DevTools til frontend debugging
- Server logs vises i terminal hvor du kørte `npm run dev`
- Ændringer i frontend filer kræver browser refresh
- Ændringer i backend filer restart automatisk serveren

---

*Har du problemer med installation? Se [Troubleshooting Guide](troubleshooting.md)*