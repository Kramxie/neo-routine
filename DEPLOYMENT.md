# Deployment Runbook & Release Checklist

## Purpose
This document lists the minimum steps to prepare a release and deploy Neo Routine to production.

## Preconditions
- A production MongoDB connection string is available
- `JWT_SECRET` is set to a secure value
- A hosting target (Vercel, DigitalOcean, AWS) is chosen and configured

## Quick checklist
- [ ] Ensure all tests pass locally: `npm test`
- [ ] Run `npm run build` and fix any build-time errors
- [ ] Verify environment variables in the target environment
- [ ] Configure SMTP credentials (if sending emails from production)
- [ ] Set up monitoring (Sentry/Datadog) and logging
- [ ] Configure backups for MongoDB

## Build & Deploy (example: Vercel)
1. Push to `main` branch
2. Vercel will run the CI workflow and build automatically
3. Ensure `MONGO_URI`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL` are set in Vercel project settings

## Rollout checklist
- [ ] Smoke test: visit `/api/health` to confirm status
- [ ] Register a new test user and complete verification flow
- [ ] Simulate subscription flow (if applicable)
- [ ] Verify emails are delivered (send test verification and reset emails)
- [ ] Confirm access control for protected pages

## Rollback
- If the release fails, revert the deployment to the previous stable tag or commit via the hosting platform.

## Notes
- For payment integrations, ensure webhooks are configured and secret keys are rotated safely.
- If using Gmail SMTP, prefer a transactional email provider in production (SendGrid, Postmark, SES).
