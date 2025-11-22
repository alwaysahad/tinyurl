# TinyLink

URL shortener built with Next.js and PostgreSQL.

## Features

- Create short links with optional custom codes
- URL validation
- Click tracking
- Dashboard with search
- Stats page for each link
- Delete links

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- PostgreSQL

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your database URL to `.env`:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

4. Run dev server:
```bash
npm run dev
```

## API

- `POST /api/links` - Create link
- `GET /api/links` - List all links
- `GET /api/links/:code` - Get link stats
- `DELETE /api/links/:code` - Delete link
- `GET /:code` - Redirect
- `GET /healthz` - Health check

## Deployment

Deploy to Vercel with a Neon PostgreSQL database.
