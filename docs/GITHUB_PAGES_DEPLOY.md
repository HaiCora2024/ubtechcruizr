# GitHub Pages Deploy (Frontend)

This repo is a Vite + React SPA. GitHub Pages can host it as static files. All "backend" work is done by HTTP endpoints.

## Prerequisites

- The workflow file exists: `.github/workflows/gh-pages.yml`
- Pages is enabled: GitHub repo **Settings → Pages → Source: GitHub Actions**

## Deploy Steps

1. Push to `main`.
   - The workflow triggers on every push to `main`.
   - Or run manually: GitHub **Actions → Deploy to GitHub Pages → Run workflow**.

2. Configure build-time variables (GitHub):
   - Repo **Settings → Secrets and variables → Actions → Variables**

3. Wait for the workflow to finish.
   - GitHub **Actions → Deploy to GitHub Pages**

4. Open the deployed site.
   - Default URL for this repo:
     - `https://haicora2024.github.io/ubtechcruizr/`

## Option A: Frontend Uses Supabase Edge Functions (No Amvera Backend)

### What it means

- The frontend calls Supabase Edge Functions via `supabase.functions.invoke(...)`.
- Supabase hosts and runs the functions (Deno).
- OpenAI key is stored in Supabase secrets (not in the frontend).

### Frontend variables (GitHub Actions Variables)

- `VITE_SUPABASE_URL` = `https://<project-ref>.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = `<anon key>`

Do **not** set `VITE_BACKEND_URL` (or leave it empty).

### Backend secrets (Supabase)

Set in Supabase Dashboard (Edge Functions / Secrets):

- `OPENAI_API_KEY` (required)
- `OPENAI_CHAT_MODEL` (optional, default: `gpt-4.1-mini`)
- `OPENAI_IMAGE_MODEL` (optional, default: `gpt-image-1`)

### Pros / Cons

Pros:
- No server to operate (Supabase runs functions)
- Centralized secrets + logs in Supabase

Cons:
- You depend on Supabase runtime for functions

## Option B: Frontend Uses Amvera Backend (Supabase Optional Fallback)

### What it means

- The frontend calls Amvera backend endpoints:
  - `https://<amvera-domain>/functions/v1/<function>`
- Your Amvera service runs the same handlers that exist under `supabase/functions/*`.
- Supabase can still exist, but it’s optional (used only if `VITE_BACKEND_URL` is not set).

### Frontend variables (GitHub Actions Variables)

- `VITE_BACKEND_URL` = `https://sveta-getcher.waw0.amvera.tech`

You can keep these too (recommended as fallback):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Backend env vars (Amvera)

Set in Amvera project env:

- `OPENAI_API_KEY` (required)
- `OPENAI_CHAT_MODEL` (optional, default: `gpt-4.1-mini`)
- `OPENAI_IMAGE_MODEL` (optional, default: `gpt-image-1`)

### Pros / Cons

Pros:
- Single backend you control (domain, logs, deploy cadence)
- You can fully remove Supabase Edge Functions if you want

Cons:
- You operate a running service (resource sizing, uptime, deploys)
- Cross-origin calls from GitHub Pages to Amvera (handled by CORS in this repo)

## Base Path Notes (Vite + Pages)

Project Pages are served under `/<repo>/`. This repo configures Vite base automatically in `vite.config.ts`, and React Router uses `basename` from `import.meta.env.BASE_URL` in `src/App.tsx`.

If you use a custom domain (served from `/`), you may set:

- `VITE_BASE` = `/`

in GitHub Actions Variables to override.

## Local CI-like Build Test (Optional)

If you want to reproduce the GitHub Actions build locally with Node 20:

```bash
export GITHUB_REPOSITORY="HaiCora2024/ubtechcruizr"
export VITE_BASE="/ubtechcruizr/"

tmp_cfg="$(mktemp -d)"
DOCKER_CONFIG="$tmp_cfg" docker pull node:20-bullseye
DOCKER_CONFIG="$tmp_cfg" docker run --rm -t \
  -v "$PWD:/app" -w /app \
  -u node \
  -e CI=true \
  -e GITHUB_REPOSITORY="$GITHUB_REPOSITORY" \
  -e VITE_BASE="$VITE_BASE" \
  node:20-bullseye bash -lc "npm ci --no-audit --no-fund && npm run build"
rm -rf "$tmp_cfg"
```

