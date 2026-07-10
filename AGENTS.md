<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deploy: push to main, never `npm run deploy` on Windows

Deploy ONLY by pushing to `main`. That triggers `.github/workflows/deploy.yml`,
which builds OpenNext on Linux (ubuntu-latest) and deploys the Worker with
wrangler. Takes ~2 min.

Do NOT run `npm run deploy` locally on Windows. OpenNext's own warning ("may
encounter unpredictable failures during runtime") is real: a Windows-built
Worker uploads assets fine but returns 500 on every SSR route (`/`, `/projects`,
`/work/*`) while static files still serve 200. A global 500 like that is the bad
Windows bundle, not your diff.

If a broken Worker is live: `npx wrangler deployments list` to find the last good
version, `npx wrangler rollback <version-id>`, then hit the ISR pages a few times
(`/`, `/projects`) to flush the poisoned KV incremental cache (they self-heal to
200). Then push to `main` for a clean CI deploy.
