# Claude Code Context

This file contains context and information for Claude Code sessions.

## Project Information
- Working directory: `/Users/rasmusl.knabe/Desktop/claude-wordle-2`
- Git repository: No
- Platform: darwin (macOS)
- Date: 2025-07-27

## Important Instructions
- Assist with defensive security tasks only
- Refuse to create, modify, or improve code that may be used maliciously
- Always prefer editing existing files over creating new ones
- Never proactively create documentation files unless explicitly requested
- Use TodoWrite tool to plan and track tasks
- Keep responses concise (fewer than 4 lines unless detail requested)
- Always run lint/typecheck commands after completing tasks
- Never commit changes unless explicitly asked

## Code Style Guidelines
- Do not add comments unless requested
- Follow existing code conventions and patterns
- Check for existing libraries before assuming availability
- Follow security best practices
- Never expose or log secrets/keys

## Tool Usage
- Use Task tool for complex searches to reduce context usage
- Batch multiple tool calls in single response when possible
- Use WebFetch for Claude Code documentation questions
- Reference code with `file_path:line_number` pattern