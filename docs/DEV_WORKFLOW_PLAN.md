# Professional Dev Workflow Setup Plan

## Project Overview

**BlueShark Frontend** - Production management SaaS (Next.js 16, TypeScript, Tailwind CSS)

## Current State Assessment

### What's Already Good

- Modern stack: Next.js 16, React 19, TypeScript 5 (strict mode)
- CI/CD: GitHub Actions with lint & build checks on PRs
- Environment management: `.env.example`, `.env`, `.env.production`
- Documentation: Comprehensive `/docs` folder with roadmap, architecture, workflow guides
- Deployment: Vercel (frontend) + Render (backend) + Neon (database)
- Error tracking: Sentry integrated

### What's Missing (Critical Gaps)

- No Prettier (code formatting inconsistency)
- No pre-commit hooks (code could bypass lint checks)
- No testing framework (zero automated tests)
- No commit message standards enforcement
- No PR/Issue templates
- No branch protection rules
- No CONTRIBUTING.md for new developers

---

## Implementation Plan

### Phase 1: Code Quality Automation

#### 1.1 Add Prettier for Code Formatting

**Files to create:**

- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore

**Configuration:**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### 1.2 Add Pre-commit Hooks (Husky + lint-staged)

**Packages to install:**

- `husky` - Git hooks manager
- `lint-staged` - Run linters on staged files only

**Configuration in package.json:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

#### 1.3 Update package.json Scripts

Add these scripts:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run format:check",
    "prepare": "husky"
  }
}
```

---

### Phase 2: GitHub Workflow Standards

#### 2.1 Branch Protection Rules (GitHub Settings)

**For `main` branch:**

- Require PR reviews (1 reviewer)
- Require status checks to pass (lint, build, type-check)
- Require branches to be up to date
- Do not allow force pushes
- Do not allow deletions

**For `dev` branch:**

- Require status checks to pass
- Allow direct pushes for quick fixes (optional)

#### 2.2 Branching Strategy

```
main (production)
  └── dev (staging)
       ├── feature/FB-xxx-description
       ├── bugfix/FB-xxx-description
       └── hotfix/critical-fix
```

**Naming Convention:**

- `feature/FB-001-add-user-auth` - New features
- `bugfix/FB-002-fix-login-error` - Bug fixes
- `hotfix/critical-security-patch` - Urgent production fixes

#### 2.3 PR Template

**File:** `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Summary

<!-- Brief description of changes -->

## Type of Change

- [ ] Feature (new functionality)
- [ ] Bug fix (fixes an issue)
- [ ] Refactor (code improvement, no behavior change)
- [ ] Docs (documentation only)
- [ ] Chore (build, CI, dependencies)

## Related Issues

<!-- Link to Jira/GitHub issues: FB-XXX -->

## Changes Made

-
-

## Testing Done

- [ ] Tested locally
- [ ] Tested on dev environment
- [ ] Added/updated tests (if applicable)

## Screenshots (if UI changes)

<!-- Add before/after screenshots -->

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] No console.log or debug code left
- [ ] No new ESLint warnings
- [ ] Build passes locally
```

#### 2.4 Issue Templates

**File:** `.github/ISSUE_TEMPLATE/bug_report.md`
**File:** `.github/ISSUE_TEMPLATE/feature_request.md`

---

### Phase 3: Developer Onboarding Documentation

#### 3.1 CONTRIBUTING.md

**File:** `CONTRIBUTING.md`

Key sections:

1. **Getting Started** - Clone, install, run
2. **Development Workflow** - Branch → Code → PR → Review → Merge
3. **Code Standards** - ESLint, Prettier, TypeScript
4. **Commit Messages** - Conventional format
5. **PR Process** - Template, reviews, CI checks

#### 3.2 Commit Message Convention

**Format:** `type(scope): description`

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `style` - Formatting (no logic change)
- `chore` - Build, CI, dependencies
- `test` - Adding tests

**Examples:**

```
feat(batch): Add bulk delete functionality
fix(login): Resolve session timeout issue
refactor(modal): Extract FilterDropdown component
docs: Update API endpoint documentation
chore: Upgrade Next.js to 16.0.7
```

---

### Phase 4: Enhanced CI/CD Pipeline

#### 4.1 Update GitHub Actions Workflow

**File:** `.github/workflows/pr-checks.yml`

Add these checks:

1. Format check (Prettier)
2. Lint check (ESLint)
3. Type check (TypeScript)
4. Build check (Next.js)
5. (Future) Test check (Jest/Vitest)

#### 4.2 Add Dependabot for Security

**File:** `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

---

### Phase 5: Development Workflow Process

#### 5.1 Daily Workflow (New Developer)

```
1. SYNC
   git checkout dev
   git pull origin dev

2. BRANCH
   git checkout -b feature/FB-XXX-description

3. CODE
   - Make changes
   - Run `npm run validate` before committing
   - Commit with conventional message

4. PUSH
   git push origin feature/FB-XXX-description

5. PR
   - Create PR to `dev` branch
   - Fill out PR template
   - Request review

6. REVIEW
   - Address feedback
   - Get approval

7. MERGE
   - Squash and merge to `dev`
   - Delete feature branch
```

#### 5.2 Release Workflow

```
1. Feature branches → merge to `dev`
2. Test on dev environment (Vercel preview)
3. When ready for release:
   - Create PR: `dev` → `main`
   - Review and approve
   - Merge to `main`
   - Production auto-deploys via Vercel
```

---

## Files to Create/Modify

### New Files

| File                                        | Purpose                  |
| ------------------------------------------- | ------------------------ |
| `.prettierrc`                               | Prettier configuration   |
| `.prettierignore`                           | Prettier ignore patterns |
| `.husky/pre-commit`                         | Pre-commit hook          |
| `.github/PULL_REQUEST_TEMPLATE.md`          | PR template              |
| `.github/ISSUE_TEMPLATE/bug_report.md`      | Bug report template      |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Feature request template |
| `.github/dependabot.yml`                    | Dependabot config        |
| `CONTRIBUTING.md`                           | Contributor guidelines   |

### Modified Files

| File                              | Changes                         |
| --------------------------------- | ------------------------------- |
| `package.json`                    | Add scripts, lint-staged, husky |
| `.github/workflows/pr-checks.yml` | Add format check                |

### GitHub Settings (Manual)

- Branch protection rules for `main` and `dev`
- Required reviewers
- Required status checks

---

## Verification Plan

After implementation:

1. Run `npm run validate` - should pass
2. Make a commit - pre-commit hook runs
3. Create a test PR - template appears
4. Check GitHub Actions - all checks pass
5. Verify branch protection - direct push to main blocked

---

## Your Preferences (Confirmed)

- **PR Reviews:** 1 reviewer required
- **Branching:** main → dev → feature/\* (GitFlow)
- **Commit Format:** Document only (no commitlint enforcement)
- **Testing:** Skip for now, add later

---

## Implementation Summary

### What We'll Set Up

| Item                 | Description                        |
| -------------------- | ---------------------------------- |
| Prettier             | Code formatting consistency        |
| Husky + lint-staged  | Pre-commit hooks                   |
| package.json scripts | validate, lint:fix, format         |
| PR Template          | Standardized PR descriptions       |
| Issue Templates      | Bug report & feature request       |
| CONTRIBUTING.md      | New developer onboarding guide     |
| Branch Protection    | 1 reviewer, status checks required |
| Dependabot           | Automated security updates         |
| Updated CI/CD        | Add format check to workflow       |

### What We Won't Set Up (Deferred)

| Item             | Reason                     |
| ---------------- | -------------------------- |
| commitlint       | Documented convention only |
| Jest/Vitest      | Testing deferred to later  |
| Storybook        | Not needed now             |
| semantic-release | Manual versioning for now  |

---

## Execution Order

### Step 1: Install Dependencies

```bash
npm install -D prettier husky lint-staged
```

### Step 2: Initialize Husky

```bash
npx husky init
```

### Step 3: Create Configuration Files

1. `.prettierrc`
2. `.prettierignore`
3. Update `package.json` (scripts + lint-staged)
4. `.husky/pre-commit`

### Step 4: Create GitHub Templates

1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/ISSUE_TEMPLATE/bug_report.md`
3. `.github/ISSUE_TEMPLATE/feature_request.md`
4. `.github/dependabot.yml`

### Step 5: Create Documentation

1. `CONTRIBUTING.md`

### Step 6: Update CI/CD

1. `.github/workflows/pr-checks.yml` (add format check)

### Step 7: Configure GitHub (Manual)

1. Branch protection for `main` (Settings → Branches → Add rule)
   - Require PR review (1 reviewer)
   - Require status checks (lint, build, type-check)
   - Block force pushes
2. Branch protection for `dev` (lighter)
   - Require status checks only

### Step 8: Test the Setup

1. Run `npm run validate`
2. Make a test commit (hook should run)
3. Create a test PR (template should appear)
4. Verify CI checks pass
