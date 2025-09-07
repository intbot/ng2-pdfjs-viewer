# Contributing to ng2-pdfjs-viewer

Thank you for your interest in contributing to ng2-pdfjs-viewer! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

- 🐛 **Bug Reports**: Use [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues) with the "bug" label
- 💡 **Feature Requests**: Use [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions) for feature ideas
- 📚 **Documentation**: Help improve our docs and examples

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.0+
- Angular CLI 20.0+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/intbot/ng2-pdfjs-viewer.git
cd ng2-pdfjs-viewer

# Install dependencies
npm install

# Install SampleApp dependencies
cd SampleApp
npm install
cd ..
```

### Getting the App Working

**Important**: Due to Angular's build cache, you may need to clear the cache before running the app:

```bash
# Clear Angular cache (Windows PowerShell)
Remove-Item -Recurse -Force "SampleApp\.angular"

# Or manually delete the .angular folder in SampleApp directory
```

### Development Commands

```bash
# Build the library
npm run build

# Run the sample app
npm run start

# Run the complete test workflow (build → publish → update → install → run)
./test.bat

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Testing Workflow

The project uses a comprehensive test workflow via `test.bat`:

1. **Build** the library
2. **Publish** to local npm registry
3. **Update** dependencies in SampleApp
4. **Install** updated dependencies
5. **Run** the SampleApp

This ensures you're testing the actual built library, not just the source code.

### Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run tests with coverage
npm run test:coverage
```

## 📝 Code Style

### TypeScript

- Use TypeScript strict mode
- Follow Angular style guide
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### HTML

- Use semantic HTML elements
- Follow Angular template best practices
- Use Angular Material components when possible

### CSS/SCSS

- Use CSS custom properties for theming
- Follow BEM methodology for class naming
- Use responsive design principles
- Avoid `!important` unless necessary

### Git

- Use conventional commit messages
- Keep commits focused and atomic
- Write descriptive commit messages

## 🏗️ Architecture

### Project Structure

```
ng2-pdfjs-viewer/
├── lib/                          # Library source code
│   ├── src/                      # TypeScript source
│   │   ├── ng2-pdfjs-viewer.component.ts
│   │   ├── interfaces/
│   │   ├── managers/
│   │   └── utils/
│   ├── pdfjs/                    # PDF.js integration
│   │   └── web/
│   │       └── postmessage-wrapper.js
│   └── dist/                     # Built library
├── SampleApp/                    # Demo application
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/         # Main demo features
│   │   │   ├── big/              # Large PDF demo
│   │   │   ├── dynamic/          # Dynamic loading demo
│   │   │   └── inline/           # Inline viewer demo
│   │   └── assets/
│   └── dist/                     # Built demo app
├── README.md                     # Main documentation
├── CHANGELOG.md                  # Version history
└── CONTRIBUTING.md               # This file
```

### Key Components

- **ng2-pdfjs-viewer.component.ts**: Main Angular component
- **postmessage-wrapper.js**: PDF.js integration layer
- **ActionQueueManager.ts**: Action dispatching system
- **PropertyTransformers.ts**: Data transformation utilities

## 🧪 Testing Guidelines

### Unit Tests

- Test all public methods and properties
- Test error conditions and edge cases
- Mock external dependencies
- Aim for 80%+ code coverage

### Integration Tests

- Test component integration with PDF.js
- Test event handling and communication
- Test different PDF sources (URL, Blob, Uint8Array)

### E2E Tests

- Test complete user workflows
- Test on different browsers
- Test responsive behavior

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Include usage examples in comments
- Document complex algorithms and logic

### README Updates

- Update feature lists when adding new features
- Add usage examples for new functionality
- Update installation and setup instructions

### API Documentation

- Document all input properties
- Document all output events
- Document all public methods
- Include type information

## 🚀 Release Process

### Version Bumping

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update version in `lib/package.json`
- Update CHANGELOG.md with new features
- Create git tag for release

### Publishing

```bash
# Build and package
npm run build
npm run package

# Publish to npm
npm publish
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Angular version
   - Node.js version
   - Browser and version
   - Operating system

2. **Reproduction Steps**
   - Clear steps to reproduce the issue
   - Expected behavior
   - Actual behavior

3. **Code Example**
   - Minimal code that reproduces the issue
   - Error messages or console output

4. **Additional Context**
   - Screenshots if applicable
   - Related issues or discussions

## 💡 Feature Requests

When requesting features, please include:

1. **Use Case**
   - Why is this feature needed?
   - How would it be used?

2. **Proposed Solution**
   - How should it work?
   - Any design considerations?

3. **Alternatives**
   - Have you considered other approaches?
   - Any workarounds currently available?

## 📋 Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🤔 Questions?

- 💬 **Discussions**: [GitHub Discussions](https://github.com/intbot/ng2-pdfjs-viewer/discussions)
- 📧 **Email**: codehippie1@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)

## 📄 License

By contributing to ng2-pdfjs-viewer, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing to ng2-pdfjs-viewer! 🎉
