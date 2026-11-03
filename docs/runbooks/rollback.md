# Rollback — DevThread

A rollback means returning DevThread to the last known-good state after a
bad deploy. Everything is a git commit plus a database restore; there is no
feature-flag system to flip.

## When to roll back
- Production is 5xx-ing or `/api/health` returns `degraded`.
- A deploy broke the build, a migration, or a critical flow (login, writing).
- A security finding ships in the bad commit.

## Decide first
1. Confirm the bad commit with `git log --oneline -8`.
2. Check if the problem is **code** (rollback) or **data** (restore from backup).
   A code bug → revert the commit. Corrupted data → restore the database.
3. Tell users if the site is degraded (see `docs/runbooks/incident.md`).

## Code rollback (fastest — try this first)
Revert the offending commit without rewriting history:

```bash
git revert --no-edit <bad-commit-sha>
git push origin main
```
Vercel deploys the revert automatically. This is safe on a shared `main` because
it produces a new, forward commit.

**Only use `git reset` + force-push if the bad commit never reached the remote**
— force-push on a shared main is dangerous and needs a second pair of eyes.

## Database rollback
If the bad deploy wrote bad data:
1. Restore the production Supabase database to a point before the deploy
   (see `docs/runbooks/backups.md`).
2. Re-deploy the last good code (the reverted commit from above).
3. Verify `/api/health` returns `ok` and the affected flow works.

## Rollback checklist
- [ ] Bad commit identified and confirmed.
- [ ] Decision recorded: code revert vs. DB restore.
- [ ] Users notified if degraded.
- [ ] Revert committed and deployed (or DB restored + redeployed).
- [ ] `/api/health` returns `ok`.
- [ ] Affected flow smoke-tested.
- [ ] Post-incident note written in `docs/runbooks/incident.md`.

## After a rollback
Write what broke, how it was found, and the fix so the next person doesn't
revert the same thing twice.