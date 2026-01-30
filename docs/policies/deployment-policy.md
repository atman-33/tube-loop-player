# Deployment Policy

## Deployment Target
- Platform: Cloudflare Workers + Pages
- Database: Cloudflare D1

## Deployment Steps
1. Run tests: `npm test`
2. Type check: `npm run typecheck`
3. Build: `npm run build`
4. Deploy: `npm run deploy` (or `wrangler deploy`)

## Pre-deployment Checklist
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Environment variables configured in Cloudflare dashboard
- [ ] Database migrations applied (production): `npm run db:migrate-production`
