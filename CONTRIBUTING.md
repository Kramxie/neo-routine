# Contributing to NeoRoutine

Welcome! We're excited that you're interested in contributing to NeoRoutine. This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Architecture Overview](#architecture-overview)

## Code of Conduct

Be respectful, inclusive, and constructive. We want NeoRoutine to be a welcoming project for everyone.

## Getting Started

### Prerequisites

- Node.js 18+ (recommend 20.x)
- MongoDB (local or Atlas)
- Git

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/neo-routine.git
   cd neo-routine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/add-calendar-view`)
- `fix/` - Bug fixes (e.g., `fix/login-redirect`)
- `docs/` - Documentation only (e.g., `docs/api-examples`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-hooks`)

### Commit Messages

Follow conventional commits:

```
type(scope): description

feat(auth): add password reset flow
fix(dashboard): correct streak calculation
docs(api): add checkout endpoint docs
test(validators): add email validation tests
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Code Style

### JavaScript/React

- Use ES Modules (`import`/`export`)
- Prefer functional components with hooks
- Use JSDoc comments for functions
- Follow existing file naming conventions

### ESLint

Run linting before committing:

```bash
npm run lint
```

### File Structure

```
neo-routine/
├── app/              # Next.js App Router pages
│   ├── (app)/        # Protected routes (dashboard, coach)
│   ├── (public)/     # Public routes (login, register)
│   └── api/          # API routes
├── components/       # React components
│   ├── ui/           # Reusable UI components
│   └── layout/       # Layout components
├── lib/              # Utilities, helpers, hooks
├── models/           # Mongoose models
├── test/             # Unit tests
└── e2e/              # End-to-end tests
```

## Testing

### Run Unit Tests

```bash
npm test
```

### Run E2E Tests

```bash
# Install browsers first
npx playwright install

# Run tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

### Writing Tests

**Unit tests** go in `test/` directory:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Feature', () => {
  it('should work correctly', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```

**E2E tests** go in `e2e/` directory using Playwright:

```javascript
import { test, expect } from '@playwright/test';

test('page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/NeoRoutine/);
});
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Run checks locally**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

5. **PR Requirements**
   - Clear description of changes
   - All CI checks pass
   - At least one reviewer approval
   - No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
How was this tested?

## Screenshots (if UI changes)
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TailwindCSS
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (httpOnly cookies)
- **Payments**: Stripe
- **Testing**: Node test runner + Playwright

### Key Patterns

**API Routes** (`app/api/`)
```javascript
import { NextResponse } from 'next/server';
import { apiResponse } from '@/lib/apiResponse';

export async function POST(request) {
  try {
    // Handle request
    return apiResponse.success({ data });
  } catch (error) {
    return apiResponse.error('Error message', 500);
  }
}
```

**Protected Routes**
- Use middleware for auth checks
- Wrapped in `(app)` route group

**Custom Hooks** (`lib/hooks.js`)
- `useFetch` - Data fetching with caching
- `useRoutines` - Routine operations
- `useCheckIns` - Check-in operations

### Database Models

- `User` - User accounts and preferences
- `Routine` - User routines with tasks
- `CheckIn` - Daily task completions
- `Goal` - User goals
- `Badge` - Achievement badges

## Questions?

Open an issue or start a discussion. We're happy to help!
