# 🚀 GitHub Pages Deployment - Step by Step

## Prerequisites
- GitHub account (https://github.com)
- Node.js installed (https://nodejs.org)
- Git installed (https://git-scm.com)

---

## Step 1: Prepare Your Project

### 1.1 Unzip the project
```bash
# Unzip burmese-learning-app.zip to a folder
```

### 1.2 Update configuration

Open `package.json` and replace `YOUR_GITHUB_USERNAME`:
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/burmese-learning-app"
```

Open `vite.config.js` - the base path should match your repo name:
```javascript
base: '/burmese-learning-app/',
```

### 1.3 Install dependencies
```bash
cd burmese-learning-app
npm install
```

### 1.4 Test locally
```bash
npm run dev
```
Open http://localhost:5173 to verify it works.

---

## Step 2: Create GitHub Repository

### 2.1 Go to GitHub
1. Visit https://github.com
2. Click the **+** icon → **New repository**

### 2.2 Repository Settings
- **Repository name**: `burmese-learning-app`
- **Description**: "Learn Burmese with conversation practice"
- **Public** (required for free GitHub Pages)
- ❌ Do NOT initialize with README
- Click **Create repository**

---

## Step 3: Push Code to GitHub

### 3.1 Initialize Git and push
```bash
cd burmese-learning-app

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Burmese Learning App"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/burmese-learning-app.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to GitHub Pages

### 4.1 Build and deploy
```bash
# This builds the app and deploys to gh-pages branch
npm run deploy
```

### 4.2 Wait for deployment
- Go to your repository on GitHub
- Click **Settings** tab
- Click **Pages** in left sidebar
- Under "Build and deployment":
  - Source: **Deploy from a branch**
  - Branch: **gh-pages** / **/ (root)**
- Click **Save**

### 4.3 Access your app
After 1-2 minutes, your app will be live at:
```
https://YOUR_USERNAME.github.io/burmese-learning-app/
```

---

## 🔄 Updating Your App

When you make changes:

```bash
# 1. Make your changes to files

# 2. Commit changes
git add .
git commit -m "Description of changes"

# 3. Push to main
git push

# 4. Deploy updated version
npm run deploy
```

---

## 📝 Adding More Conversations

1. Edit `public/data/Burmese_Conversation.csv`
2. Add new topics following the format:
```csv
Sr. No.,Tag,Burmese,English
25,Title,-,New Topic
26,Description,-,Topic description
27,Bot,ဗမာစာ,English meaning
28,User,ဗမာစာ,English meaning
29,End,---------,---------
```
3. Commit and deploy:
```bash
git add .
git commit -m "Added new topic"
git push
npm run deploy
```

---

## ❗ Troubleshooting

### "Page not found" error
- Check that `base` in `vite.config.js` matches your repo name
- Make sure gh-pages branch exists
- Wait a few minutes for GitHub to build

### CSV files not loading
- Check browser console for errors
- Verify file paths start with `/burmese-learning-app/data/`

### Changes not appearing
- Clear browser cache (Ctrl+Shift+R)
- Wait 1-2 minutes after deploy

---

## 📂 Your Repository Structure

After deployment, your repo will have:
```
main branch (source code):
├── public/data/*.csv
├── src/App.jsx
├── package.json
└── ...

gh-pages branch (built app):
├── index.html
├── assets/
└── data/*.csv
```

---

## 🎉 Done!

Your Burmese Learning App is now live at:
**https://YOUR_USERNAME.github.io/burmese-learning-app/**

Share this link with anyone who wants to learn Burmese!
