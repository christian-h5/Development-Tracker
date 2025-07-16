#!/bin/bash

echo "Creating clean DevTracker package..."

# Create clean package directory
mkdir -p devtracker-clean

# Copy essential source files
echo "Copying core application files..."
cp -r client devtracker-clean/
cp -r server devtracker-clean/
cp -r shared devtracker-clean/

# Copy only essential config files
cp package.json devtracker-clean/
cp vite.config.ts devtracker-clean/
cp tsconfig.json devtracker-clean/
cp tailwind.config.ts devtracker-clean/
cp postcss.config.js devtracker-clean/
cp components.json devtracker-clean/

# Copy minimal deployment files
cp build-static.js devtracker-clean/

# Remove unnecessary files from the package
echo "Cleaning up unnecessary files..."

# Remove development-only files
rm -f devtracker-clean/client/.DS_Store
rm -rf devtracker-clean/client/.cache
rm -rf devtracker-clean/server/.cache

# Create minimal package.json without dev dependencies we don't need
cat > devtracker-clean/package-lean.json << 'EOF'
{
  "name": "devtracker-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "build:static": "node build-static.js",
    "start": "NODE_ENV=production node dist/index.js"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@tanstack/react-query": "^5.60.5",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "express": "^4.21.2",
    "jspdf": "^3.0.1",
    "jspdf-autotable": "^5.0.2",
    "lucide-react": "^0.453.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "tailwind-merge": "^2.6.0",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "tailwindcss": "^3.4.17",
    "typescript": "5.6.3",
    "tsx": "^4.19.1",
    "vite": "^5.4.19"
  }
}
EOF

# Create simple deployment README
cat > devtracker-clean/DEPLOY.md << 'EOF'
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
EOF

# Create .gitignore
cat > devtracker-clean/.gitignore << 'EOF'
node_modules/
dist/
.env
.DS_Store
*.log
EOF

echo "Package size comparison:"
echo "Original: $(du -sh devtracker-app-package 2>/dev/null | cut -f1 || echo 'N/A')"
echo "Clean: $(du -sh devtracker-clean | cut -f1)"

echo ""
echo "✅ Clean package created: devtracker-clean/"
echo "📁 Contains only essential files for deployment"
echo "🚀 Ready to upload to any hosting platform"