# Contributing to DataMarket Protocol

Thank you for your interest in contributing to DataMarket Protocol! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- MetaMask wallet
- Basic knowledge of React, Next.js, and blockchain development

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DataMarket.git
   cd DataMarket
   ```

2. **Install dependencies**
   ```bash
   cd web
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

5. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible

### React/Next.js
- Use functional components with hooks
- Follow Next.js 15 App Router patterns
- Use Tailwind CSS for styling

### File Naming
- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for function and variable names

## 🧪 Testing

### Frontend Testing
```bash
npm run test
npm run test:watch
```

### Smart Contract Testing
```bash
npm run test:contracts
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the project's style guidelines
- [ ] Self-review of your code
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console.log statements in production code

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Screenshots/videos if UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🐛 Reporting Issues

### Bug Reports
Use the GitHub issue template and include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

### Feature Requests
- Clear description of the feature
- Use case and motivation
- Potential implementation ideas
- Any additional context

## 🏗️ Architecture Guidelines

### Component Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state
├── lib/               # Utility functions and services
├── app/               # Next.js app router pages
└── types/             # TypeScript type definitions
```

### Smart Contract Structure
```
contracts/
├── DataMarket.sol     # Main marketplace contract
├── interfaces/        # Contract interfaces
└── libraries/         # Reusable contract libraries
```

## 🔒 Security

### Security Considerations
- Never commit private keys or sensitive data
- Use environment variables for configuration
- Follow secure coding practices
- Report security vulnerabilities privately

### Reporting Security Issues
Email: security@datamarket-protocol.com
- Include detailed description
- Steps to reproduce
- Potential impact assessment

## 📚 Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Include examples for complex functions
- Document API endpoints thoroughly

### README Updates
- Update README.md for new features
- Include setup instructions
- Add troubleshooting sections

## 🎯 Roadmap

### Current Priorities
- [ ] Enhanced data collection features
- [ ] Advanced zero-knowledge proofs
- [ ] Multi-chain support
- [ ] Mobile application

### Contribution Areas
- Frontend development
- Smart contract development
- Documentation
- Testing
- Security auditing

## 💬 Community

### Communication Channels
- GitHub Discussions for questions
- Discord for real-time chat
- Twitter for updates

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the golden rule

## 📄 License

By contributing to DataMarket Protocol, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DataMarket Protocol! 🚀
