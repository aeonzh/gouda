# Agent Guidelines for Gouda Project

This document outlines essential commands and code style guidelines for agents working on the Gouda project.

## Build/Lint/Test Commands

- **Start Development Server**: `npm start` or `expo start`
- **Lint Code**: `npm run lint`
- **Format Code**: `npm run format`
- **Testing**: No explicit test command found in `package.json`. Testing framework and single test execution commands depend on the chosen testing setup (e.g., Jest).

## Code Style Guidelines

- **Language**: TypeScript for strong typing and improved code quality.
- **Formatting**: Enforced by Prettier. Run `npm run format` to auto-format code.
- **Linting**: Enforced by ESLint with `eslint-config-universe`. Run `npm run lint` to check for linting issues.
- **Imports**: Follow ESLint import order rules. Prefer absolute imports for project modules.
- **Naming Conventions**:
  - Variables and functions: `camelCase`
  - React Components and Types: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Error Handling**: Use standard `try-catch` blocks for synchronous operations and handle Promise rejections for asynchronous code.
- **Styling**: Utilize NativeWind and Tailwind CSS for a utility-first approach.

## AI-Specific Rules

- **Cursor Rules**: No `.cursor/rules/` or `.cursorrules` found.
- **Copilot Instructions**: No `.github/copilot-instructions.md` found.
