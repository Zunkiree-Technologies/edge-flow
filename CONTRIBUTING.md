# Contributing to BlueShark Frontend

Welcome to the BlueShark Frontend project! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd edge-flow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app runs at http://localhost:3000

### Backend Setup

```bash
cd blueshark-backend-test/backend
npm install
npm run dev
```

Backend runs at http://localhost:5001

---

## Development Workflow

### 1. Sync with Latest Code

```bash
git checkout dev
git pull origin dev
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/FB-XXX-description
```

**Branch naming:**

- `feature/FB-XXX-description` - New features
- `bugfix/FB-XXX-description` - Bug fixes
- `hotfix/critical-fix` - Urgent production fixes

### 3. Make Changes

- Write your code
- Run validation before committing:
  ```bash
  npm run validate
  ```

### 4. Commit Your Changes

```bash
git add <files>
git commit -m "feat(scope): description"
```

**Commit message format:** `type(scope): description`

| Type       | Description                  |
| ---------- | ---------------------------- |
| `feat`     | New feature                  |
| `fix`      | Bug fix                      |
| `refactor` | Code refactoring             |
| `docs`     | Documentation                |
| `style`    | Formatting (no logic change) |
| `chore`    | Build, CI, dependencies      |
| `test`     | Adding tests                 |

**Examples:**

```
feat(batch): Add bulk delete functionality
fix(login): Resolve session timeout issue
refactor(modal): Extract FilterDropdown component
docs: Update API documentation
chore: Upgrade Next.js to 16.0.7
```

### 5. Push and Create PR

```bash
git push origin feature/FB-XXX-description
```

Then create a Pull Request to `dev` branch on GitHub.

### 6. Code Review

- Fill out the PR template
- Request review from a team member
- Address feedback
- Get approval

### 7. Merge

- Squash and merge to `dev`
- Delete your feature branch

---

## Code Standards

### Linting & Formatting

We use ESLint and Prettier for code quality.

```bash
# Check for issues
npm run lint
npm run format:check

# Auto-fix issues
npm run lint:fix
npm run format

# Full validation (type-check + lint + format)
npm run validate
```

### Pre-commit Hooks

Husky runs lint-staged on every commit:

- ESLint with auto-fix
- Prettier formatting

If a commit fails, fix the issues and try again.

### TypeScript

- Strict mode is enabled
- No `any` types without justification
- Use proper interfaces for API responses

---

## Available Scripts

| Script                 | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start dev server (Turbopack) |
| `npm run build`        | Production build             |
| `npm run lint`         | Run ESLint                   |
| `npm run lint:fix`     | Fix ESLint issues            |
| `npm run format`       | Format with Prettier         |
| `npm run format:check` | Check formatting             |
| `npm run type-check`   | TypeScript type check        |
| `npm run validate`     | Run all checks               |

---

## Project Structure

```
src/
├── app/
│   ├── Components/      # Shared components
│   ├── Dashboard/       # Admin dashboard
│   ├── SupervisorDashboard/  # Supervisor views
│   ├── loginandsignup/  # Auth pages
│   └── utils/           # Utilities
├── docs/                # Documentation
└── public/              # Static assets
```

---

## Branching Strategy

```
main (production)
  └── dev (staging)
       ├── feature/FB-xxx-description
       ├── bugfix/FB-xxx-description
       └── hotfix/critical-fix
```

- **main**: Production deployments (protected)
- **dev**: Staging/testing (PR required)
- **feature/\***: Your work branches

---

## Need Help?

- Check `/docs` folder for detailed documentation
- Ask in the team chat
- Create a GitHub issue

Happy coding!
