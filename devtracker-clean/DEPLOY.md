# DevTracker App - Deployment

## Quick Deploy

### Netlify (Recommended)
1. Drag this folder to netlify.com
2. Build command: `npm run build:static`
3. Publish directory: `dist`

### Vercel
1. Upload to GitHub
2. Connect at vercel.com
3. Build command: `npm run build:static`
4. Output directory: `dist`

### Manual Static Deploy
```bash
npm install
npm run build:static
# Upload dist/ folder to any static host
```

### Full Stack Deploy
```bash
npm install
npm run dev
# Deploy as Node.js app
```

## What's Included
- React + TypeScript frontend
- localStorage data persistence
- PDF export functionality
- Project tracking & calculator
- No database required

Your app is ready to deploy!
