# Test Documentation

This directory contains all tests for the Danish Wordle project.

## Test Structure

```
tests/
├── unit/               # Unit tests for individual modules
│   ├── game.test.js   # WordleGame class tests
│   └── words.test.js  # Word management tests
├── integration/        # API integration tests
│   └── api.test.js    # Express server endpoint tests
├── frontend/          # Frontend UI and logic tests
│   └── ui.test.js     # DOM interaction and game UI tests
├── fixtures/          # Test data and mock files
│   └── testWords.txt  # Sample word list for testing
└── README.md          # This file
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# Unit tests only
npm test -- --testPathPattern=tests/unit

# Integration tests only  
npm test -- --testPathPattern=tests/integration

# Frontend tests only
npm test -- --testPathPattern=tests/frontend
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Reports
```bash
npm run test:coverage
```

This generates a coverage report in the `coverage/` directory.

## Test Configuration

Tests are configured in `package.json`:

```json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "*.js",
      "!server.js",
      "!jest.config.js"
    ],
    "testMatch": [
      "**/tests/**/*.test.js"
    ]
  }
}
```

## Test Types

### Unit Tests (`tests/unit/`)

Test individual modules in isolation:

- **`game.test.js`**: WordleGame class functionality
  - Game initialization
  - Guess validation and processing
  - Win/lose conditions
  - Feedback generation
  - Game state management

- **`words.test.js`**: Word management system
  - Daily word selection
  - Word validation
  - File loading and parsing
  - Error handling

### Integration Tests (`tests/integration/`)

Test API endpoints and server functionality:

- **`api.test.js`**: Express server integration
  - GET `/game` endpoint
  - POST `/guess` endpoint  
  - GET `/health` endpoint
  - Session management
  - Error handling
  - Content-Type validation

### Frontend Tests (`tests/frontend/`)

Test browser-side functionality:

- **`ui.test.js`**: User interface and interactions
  - DOM element creation
  - Keyboard input handling
  - Virtual keyboard clicks
  - Game board updates
  - Visual feedback
  - Error display

## Mock Strategy

### Backend Mocking
- `words.js` module is mocked for consistent test data
- File system operations are mocked to avoid dependencies
- Deterministic word selection for predictable tests

### Frontend Mocking  
- Fetch API is mocked for HTTP requests
- JSDOM provides browser-like environment
- Console methods are mocked to reduce test noise

### Test Data
- `tests/fixtures/testWords.txt` contains sample Danish words
- Tests use controlled word lists for predictable behavior

## Continuous Integration

Tests run automatically on:
- Push to `master` or `develop` branches
- Pull requests to `master`
- Multiple Node.js versions (16, 18, 20)

See `.github/workflows/test.yml` for CI configuration.

## Coverage Goals

Target coverage thresholds:
- **Statements**: >90%
- **Branches**: >85%  
- **Functions**: >90%
- **Lines**: >90%

## Writing New Tests

### Test File Naming
- Unit tests: `[module-name].test.js`
- Integration tests: `[feature-area].test.js`
- Frontend tests: `[component-area].test.js`

### Test Structure
```javascript
const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('Module/Feature Name', () => {
  describe('specific functionality', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Best Practices
1. **Descriptive test names** that explain what is being tested
2. **Arrange-Act-Assert** pattern for clarity
3. **One assertion per test** when possible
4. **Mock external dependencies** for isolated testing
5. **Test both success and error cases**
6. **Use beforeEach for common setup**
7. **Clean up after tests** (close servers, restore mocks)

## Debugging Tests

### Run Single Test File
```bash
npm test -- tests/unit/game.test.js
```

### Run Single Test
```bash
npm test -- --testNamePattern="should win when correct word is guessed"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/game.test.js
```

Then connect Chrome debugger to `chrome://inspect`.

## Common Issues

### "Cannot find module" errors
- Ensure all dependencies are installed: `npm install`
- Check that file paths are correct in require statements

### "fetch is not defined" errors  
- Frontend tests mock fetch, ensure mock is properly set up
- Integration tests use supertest, not direct fetch calls

### "Document is not defined" errors
- Ensure JSDOM is properly configured for frontend tests
- Check that global window/document are set correctly

### Port conflicts in integration tests
- Tests use random ports to avoid conflicts
- If issues persist, ensure previous test processes are killed

## Performance

### Parallel Execution
Jest runs tests in parallel by default. For debugging or resource constraints:

```bash
npm test -- --runInBand
```

### Test Timeouts
Default timeout is 5 seconds. For slower tests:

```javascript
test('slow operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

---

*Happy testing! 🧪*