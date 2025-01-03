# 🌐 dawidrylko.com

[![Continuous Integration](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/ci.yml)
[![Continuous Deployment](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/cd.yml)
[![CodeQL](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dawidrylko/dawidrylko.com/actions/workflows/github-code-scanning/codeql)

My personal website based on [React](https://react.dev) and [Gatsby](https://www.gatsbyjs.com).

## 🚀 Development

### 📋 Prerequisites

- Node.js (LTS version recommended)
- pnpm

### 🔧 Installation

```bash
pnpm install
```

### 📝 Available Scripts

- `pnpm develop` or `pnpm start` - Start the development server
- `pnpm build` - Build the production-ready site
- `pnpm serve` - Serve the production build locally
- `pnpm clean` - Clean the cache and public directories

### ⚡ Quality Assurance

- `pnpm type:check` - Run TypeScript type checking
- `pnpm format:write` - Format code using Prettier
- `pnpm format:check` - Check code formatting
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm lint:check` - Check for ESLint issues

The project uses Husky for git hooks and lint-staged for running checks on staged files before commits.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

This project was created by [Dawid Ryłko](https://dawidrylko.com).
