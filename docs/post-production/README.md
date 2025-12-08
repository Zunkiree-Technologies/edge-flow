# Post-Production Documentation

**Purpose:** All documentation related to production deployment, client feedback, and ongoing maintenance.

**Production Live Since:** December 8, 2025

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `FEEDBACK_TRACKER.md` | Track all client feedback and convert to actions |
| `RELEASE_NOTES.md` | Version history and what changed in each release |
| `KNOWN_ISSUES.md` | Issues we're aware of but haven't fixed yet |
| `CLIENT_COMMUNICATION.md` | Log of important client communications |

---

## Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://edge-flow-gamma.vercel.app |
| **Backend** | https://edge-flow-backend.onrender.com |
| **Database** | Neon PostgreSQL (production branch) |

---

## Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | admin |

---

## Quick Reference

### When Client Reports Issue
1. Log in `FEEDBACK_TRACKER.md`
2. Triage priority
3. Add to `docs/BACKLOG.md` if bug
4. Fix on `dev` branch
5. Test locally
6. Merge to `main` (requires password: DEPLOY)
7. Update feedback status
8. Notify client

### Deployment Checklist
- [ ] All changes tested on dev branch
- [ ] No console errors
- [ ] Build passes (`npm run build`)
- [ ] Merge to main with DEPLOY password
- [ ] Verify production after deploy
- [ ] Update RELEASE_NOTES.md

---

## Related Files

- `docs/BACKLOG.md` - Bug & issue tracking
- `docs/ROADMAP.md` - Feature planning
- `.brain/session-logs/2025-12-08-production-v1-release.md` - Initial release notes

---

**Last Updated:** 2025-12-08
