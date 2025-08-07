# Session Notes & Decisions

## Session 1: Aug 7, 2025 - Project Setup & Testing
### Context Started
- User: Rasmus, working on Danish Wordle clone
- Goal: Add comprehensive testing and documentation
- Environment: macOS, VS Code with Claude Code integration

### Major Work Done
1. **MCP SSH Integration**
   - Tested connection to server 185.185.126.120
   - SSH key authentication setup required
   - Successfully connected and explored server environment

2. **Project Deployment**  
   - Installed Node.js v22.18.0 + npm on CentOS server
   - Cloned Git repo to /home/rasmusknabe/wordle/
   - Setup Apache virtual host with reverse proxy
   - Generated Let's Encrypt SSL certificate
   - Live site: https://wordle.rasmusknabe.dk

3. **Mobile Optimization**
   - Fixed responsive design for iPhone 12 mini
   - Adjusted game-board padding from 65px → 20px → 60px
   - Added media queries for small screens (375px)
   - Tested and deployed multiple CSS iterations

4. **Comprehensive Documentation**
   - Created /docs structure with Jekyll config
   - 8 detailed documentation files (900+ lines each)
   - Setup GitHub Pages: https://rasmusknabe.github.io/danish-wordle
   - Covered installation, deployment, API, architecture, troubleshooting

5. **Test Suite Implementation**
   - Added Jest, Supertest, JSDOM dependencies
   - Created 50+ test cases across unit/integration/frontend
   - Fixed game.js feedback format (objects vs strings)
   - Setup GitHub Actions CI/CD pipeline
   - Had to simplify to working baseline due to complexity issues

### Key Decisions Made
- **Testing Strategy**: Focus on working simple tests vs broken comprehensive
- **Mobile Design**: 60px padding for consistent spacing across devices  
- **Deployment**: Apache reverse proxy to Node.js backend
- **Documentation**: GitHub Pages for professional project presentation
- **CI/CD**: Automated testing on push/PR with multiple Node versions

### Technical Challenges Solved
- SSH authentication with passphrase protection
- Apache virtual host configuration conflicts
- Jest test environment and server lifecycle issues
- Mobile responsive design across different screen sizes
- Game logic API consistency between frontend/backend

### User Preferences Observed
- Prefers working solutions over perfect but broken code
- Values comprehensive documentation and professional presentation
- Likes step-by-step explanations and clear progress tracking
- Appreciates deployment automation and live testing
- Wants to understand the "why" behind technical decisions

### Next Session Preparation
When user returns, start with:
1. "I see we were working on Danish Wordle testing and documentation"
2. "Last session we got basic tests working but had integration test issues"
3. "Should we continue improving the test suite or work on new features?"
4. Check CLAUDE.md and this file for latest context

### Unresolved Items for Future
- Integration tests have server lifecycle conflicts
- Frontend tests need JSDOM function availability fixes  
- Could add more advanced features (statistics, sharing, etc.)
- Performance optimization and monitoring setup
- User authentication and game statistics