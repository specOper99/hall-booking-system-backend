# HallHub Backend - Deployment Guide

## Free Deployment Options

### 🚂 Railway (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   railway login
   railway init
   railway add --database postgres
   railway up
   ```

3. **Set Environment Variables**
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
   - `JWT_EXPIRATION` - e.g., `7d`
   - `NODE_ENV` - `production`
   - `DATABASE_URL` - Auto-provided by Railway

---

### 🎨 Render

1. **Push to GitHub**

2. **Create New Web Service**
   - Connect your repository
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

3. **Add PostgreSQL Database**
   - Create new PostgreSQL instance (free tier)
   - Copy `Internal Database URL`

4. **Set Environment Variables**
   ```
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<generate-strong-secret>
   JWT_EXPIRATION=7d
   NODE_ENV=production
   ```

---

### 🐳 Docker (Any Platform)

```bash
docker build -t hallhub-api .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -e NODE_ENV=production \
  hallhub-api
```

---

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Strong random string (min 32 chars) | `openssl rand -base64 32` |
| `JWT_EXPIRATION` | Token expiry | `7d` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port (usually auto-set) | `3000` |
