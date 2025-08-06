# API Reference

Danish Wordle backend API dokumentation med alle endpoints og deres funktionalitet.

## Base URL

```
Production: https://wordle.rasmusknabe.dk
Development: http://localhost:3000
```

## Endpoints

### 1. Start nyt spil

**GET** `/game`

Starter et nyt Wordle spil og returnerer den aktuelle spiltilstand.

#### Response

```json
{
  "success": true,
  "data": {
    "gameState": "playing",
    "attempts": 0,
    "maxAttempts": 6,
    "guesses": [],
    "lastGuess": null,
    "word": null
  }
}
```

#### Response felter

- `gameState`: Spillets tilstand (`"playing"`, `"won"`, `"lost"`)
- `attempts`: Antal gæt brugt
- `maxAttempts`: Maksimalt antal gæt (altid 6)
- `guesses`: Array af tidligere gæt med feedback
- `lastGuess`: Det seneste gæt og dets feedback
- `word`: Det rigtige ord (kun vist når spillet er slut)

#### Eksempel

```bash
curl -X GET https://wordle.rasmusknabe.dk/game
```

---

### 2. Indgiv gæt

**POST** `/guess`

Indgiver et gæt og returnerer feedback samt opdateret spiltilstand.

#### Request Body

```json
{
  "guess": "HUSET"
}
```

#### Request felter

- `guess`: Et 5-bogstav dansk ord (case-insensitive)

#### Response - Gyldigt gæt

```json
{
  "success": true,
  "data": {
    "gameState": "playing",
    "attempts": 1,
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
    "lastGuess": {
      "word": "HUSET",
      "feedback": [
        {"letter": "H", "status": "wrong"},
        {"letter": "U", "status": "wrong-position"},
        {"letter": "S", "status": "correct"},
        {"letter": "E", "status": "wrong"},
        {"letter": "T", "status": "wrong-position"}
      ]
    },
    "word": null
  }
}
```

#### Feedback status værdier

- `"correct"`: Bogstavet er på den rigtige plads (grøn)
- `"wrong-position"`: Bogstavet er i ordet men forkert plads (gul)
- `"wrong"`: Bogstavet er ikke i ordet (grå)

#### Response - Spil vundet

```json
{
  "success": true,
  "data": {
    "gameState": "won",
    "attempts": 3,
    "maxAttempts": 6,
    "guesses": [...],
    "lastGuess": {...},
    "word": "STOLE"
  }
}
```

#### Response - Spil tabt

```json
{
  "success": true,
  "data": {
    "gameState": "lost",
    "attempts": 6,
    "maxAttempts": 6,
    "guesses": [...],
    "lastGuess": {...},
    "word": "STOLE"
  }
}
```

#### Error Response - Ugyldigt gæt

```json
{
  "success": false,
  "error": "Ordet skal være 5 bogstaver langt"
}
```

```json
{
  "success": false,
  "error": "Ordet findes ikke i ordlisten"
}
```

#### Error Response - Spil allerede slut

```json
{
  "success": false,
  "error": "Spillet er allerede afsluttet"
}
```

#### Eksempel

```bash
curl -X POST https://wordle.rasmusknabe.dk/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"HUSET"}'
```

---

### 3. Health Check

**GET** `/health`

Checker om serveren kører korrekt.

#### Response

```json
{
  "status": "OK",
  "timestamp": "2025-08-05T17:45:00.000Z",
  "uptime": 3600
}
```

#### Response felter

- `status`: Server status (`"OK"`)
- `timestamp`: Aktuel server tid (ISO 8601)
- `uptime`: Server uptime i sekunder

#### Eksempel

```bash
curl -X GET https://wordle.rasmusknabe.dk/health
```

---

## Session Management

Spillet bruger cookies til at gemme session state. Hver spiller får automatisk tildelt en unik session når de besøger siden første gang.

### Session Cookie

- **Navn**: `wordleSession`
- **Type**: UUID v4
- **Expiry**: Session (browser lukkes)
- **HttpOnly**: Nej (tilgængelig for JavaScript)

### Session Data

Serveren gemmer følgende data per session:

- Aktuelt ord der skal gættes
- Antal forsøg brugt
- Historie over alle gæt
- Spil tilstand (playing/won/lost)

## Error Codes

| HTTP Status | Beskrivelse |
|-------------|-------------|
| 200 | Success - Request behandlet korrekt |
| 400 | Bad Request - Ugyldigt input |
| 404 | Not Found - Endpoint ikke fundet |
| 500 | Internal Server Error - Server fejl |

## Rate Limiting

Der er ingen rate limiting implementeret i øjeblikket.

## CORS

CORS er konfigureret til at tillade alle origins i development. I production skal det konfigureres til kun at tillade trusted domains.

## Content Types

- **Request**: `application/json`
- **Response**: `application/json`

---

*API dokumentation sidst opdateret: 5. august 2025*