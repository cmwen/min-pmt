# Contributing to min-pmt

## Development Setup

1. **Prerequisites**:
   - Node.js >= 18.18
   - pnpm >= 9

2. **Clone and install**:
   ```bash
   git clone https://github.com/cmwen/min-pmt.git
   cd min-pmt
   pnpm install
   ```

3. **Build and test**:
   ```bash
   pnpm build
   pnpm test
   pnpm lint:ci
   ```

## Project Structure

This is a monorepo with the following packages:

- **`packages/core`** - Core ticket management engine
- **`packages/cli`** - Command-line interface (main published package)
- **`packages/web`** - Web UI server and client
- **`packages/mcp`** - Model Context Protocol server

## Development Workflow

1. **Code quality**: All code must pass linting and formatting:
   ```bash
   pnpm lint        # Fix auto-fixable issues
   pnpm lint:ci     # Check for issues
   pnpm format      # Format code
   ```

2. **Testing**: Add tests for new features and ensure all tests pass:
   ```bash
   pnpm test
   ```

3. **Building**: Ensure all packages build successfully:
   ```bash
   pnpm build
   ```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all quality checks pass: `pnpm build && pnpm test && pnpm lint:ci`
6. Commit with descriptive messages
7. Push and create a pull request

## Release Process

1. Update version in `packages/cli/package.json`
2. Create a git tag: `git tag v0.x.x`
3. Push tag: `git push origin v0.x.x`
4. GitHub Actions will automatically publish to npm

## Architecture Guidelines

- **Core Library**: Keep `@min-pmt/core` focused on ticket management logic
- **CLI Package**: Main user-facing package, should be lightweight and well-documented
- **File-based**: All data stored as Markdown files with YAML frontmatter
- **TypeScript**: All code should be properly typed
- **ESM**: Use ES modules with explicit `.js` extensions in imports

## Code Style

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use Biome for formatting and linting
- Write descriptive commit messages
- Keep functions small and focused