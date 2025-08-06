# Danish Wordle

![Tests](https://github.com/RasmusKnabe/danish-wordle/workflows/Tests/badge.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A Danish version of the popular word-guessing game Wordle. Built with Node.js and vanilla JavaScript.

🎮 **[Play now at wordle.rasmusknabe.dk](https://wordle.rasmusknabe.dk)**

📚 **[Full Documentation](https://rasmusknabe.github.io/danish-wordle)**

## 🎯 Features

- **Daily Danish Word**: New 5-letter Danish word every day
- **6 Attempts**: Classic Wordle gameplay with 6 guesses
- **Color Feedback**: Green (correct), Yellow (wrong position), Gray (not in word)
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Session Persistence**: Game state saved during session
- **8000+ Words**: Comprehensive Danish word database

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/RasmusKnabe/danish-wordle.git
cd danish-wordle

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

## 🧪 Testing

This project has comprehensive test coverage including unit, integration, and frontend tests.

### Run All Tests
```bash
npm test
```

### Test Categories
```bash
# Unit tests (game logic, word validation)
npm test -- --testPathPattern=tests/unit

# Integration tests (API endpoints)  
npm test -- --testPathPattern=tests/integration

# Frontend tests (UI interactions)
npm test -- --testPathPattern=tests/frontend
```

### Coverage Report
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

See [Test Documentation](tests/README.md) for detailed testing information.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│  Apache Server  │◄──►│  Node.js App    │
│   (Frontend)    │    │  (Reverse Proxy)│    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3  
- **Server**: Apache with SSL (Let's Encrypt)
- **Testing**: Jest, Supertest, JSDOM
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
danish-wordle/
├── public/              # Frontend static files
│   ├── index.html      # Main HTML page
│   ├── script.js       # Game logic & UI
│   └── style.css       # Responsive styling
├── tests/              # Test suites
│   ├── unit/          # Unit tests  
│   ├── integration/   # API tests
│   ├── frontend/      # UI tests
│   └── fixtures/      # Test data
├── docs/              # Documentation
├── .github/           # GitHub Actions workflows
├── server.js          # Express server
├── game.js            # WordleGame class
├── words.js           # Word management
├── ordliste.txt       # Danish word database
└── package.json       # Dependencies & scripts
```

## 🎮 How to Play

1. **Guess the word**: Enter a 5-letter Danish word
2. **Get feedback**: 
   - 🟢 **Green**: Right letter, right position
   - 🟡 **Yellow**: Right letter, wrong position  
   - ⚫ **Gray**: Letter not in word
3. **Use clues**: Make your next guess based on the feedback
4. **Win or lose**: Guess the word in 6 tries or less!

## 🔧 Development

### Available Scripts

```bash
npm start      # Production server
npm run dev    # Development with auto-reload
npm test       # Run all tests
npm run test:watch    # Watch mode testing
npm run test:coverage # Generate coverage report
```

### API Endpoints

- `GET /game` - Start new game / get current state
- `POST /guess` - Submit a guess
- `GET /health` - Server health check

See [API Reference](docs/api-reference.md) for detailed documentation.

## 🚀 Deployment

### Production Deployment

1. **Server Setup**: Linux server with Apache and Node.js
2. **Clone & Install**: Repository and dependencies
3. **Apache Config**: Reverse proxy to Node.js backend
4. **SSL Setup**: Let's Encrypt certificate
5. **DNS Configuration**: Point domain to server

See [Deployment Guide](docs/deployment.md) for step-by-step instructions.

### Development Deployment

```bash
# Local development
npm run dev

# Test production build
npm start
```

## 📈 Testing & Quality

### Test Coverage
- **Unit Tests**: Game logic, word validation  
- **Integration Tests**: API endpoints, session management
- **Frontend Tests**: UI interactions, DOM updates
- **End-to-End**: Complete gameplay scenarios

### Continuous Integration
- **GitHub Actions**: Automated testing on push/PR
- **Multi-version**: Tested on Node.js 16, 18, 20
- **Security Audits**: Automated vulnerability scanning
- **Coverage Reporting**: Integration with Codecov

### Code Quality
- **ESLint**: Code style and quality checks (planned)
- **Prettier**: Automatic code formatting (planned)
- **Jest**: Comprehensive test framework
- **JSDoc**: Code documentation (planned)

## 🤝 Contributing

We welcome contributions! Please read our [Development Guide](docs/development.md) for:

- Coding standards and style guide
- Git workflow and branch naming
- Pull request process  
- Testing requirements

### Quick Contribution Steps

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Ensure tests pass: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📚 Documentation

Comprehensive documentation is available at: **[rasmusknabe.github.io/danish-wordle](https://rasmusknabe.github.io/danish-wordle)**

- [Installation Guide](docs/installation.md) - Local development setup
- [Deployment Guide](docs/deployment.md) - Production deployment  
- [API Reference](docs/api-reference.md) - Backend API documentation
- [Architecture Guide](docs/architecture.md) - Technical architecture
- [User Guide](docs/user-guide.md) - How to play the game
- [Development Guide](docs/development.md) - Contributing guidelines
- [Troubleshooting Guide](docs/troubleshooting.md) - Common issues

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/RasmusKnabe/danish-wordle/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/RasmusKnabe/danish-wordle/issues)
- **Questions**: [GitHub Discussions](https://github.com/RasmusKnabe/danish-wordle/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html) by Josh Wardle
- Danish word list compiled from various open-source dictionaries
- Built with ❤️ for the Danish gaming community

## 📊 Stats

- **8000+ Danish Words** in database
- **Comprehensive Test Suite** with 50+ test cases  
- **Mobile Responsive** design for all devices
- **Production Ready** with SSL and monitoring
- **Open Source** under MIT license

---

**Enjoy playing Danish Wordle! 🇩🇰**

*Made with ❤️ by the Danish Wordle team*