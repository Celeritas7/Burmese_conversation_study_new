# 🚀 Burmese Learning Chatbot - Complete Setup Guide

## 📁 Project Folder Structure

```
burmese-learning-app/
├── public/
│   ├── data/
│   │   ├── Consonants.csv
│   │   ├── Vowels.csv
│   │   ├── Special_characters.csv
│   │   ├── Burmese_Conversation.csv
│   │   └── Special_cases.csv          (optional)
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.jsx                         (main chatbot code)
│   └── index.js
├── package.json
└── README.md
```

---

## 📋 Step-by-Step Setup

### Step 1: Create React Project

```bash
# Using Vite (recommended - faster)
npm create vite@latest burmese-learning-app -- --template react
cd burmese-learning-app
npm install
```

### Step 2: Replace App.jsx

Copy the contents of `burmese-chatbot-v3.jsx` into `src/App.jsx`

### Step 3: Create Data Folder

```bash
mkdir -p public/data
```

### Step 4: Add Your CSV Files

Copy these files to `public/data/`:
- `Consonants.csv`
- `Vowels.csv`  
- `Special_characters.csv`
- `Burmese_Conversation.csv`

### Step 5: Create Special_cases.csv (Optional)

Create `public/data/Special_cases.csv`:

```csv
Burmese,Devanagari
မင်္ဂလာပါ,मिं2ग1ला2बा2
ကျေးဇူးတင်ပါတယ်,चे3जु2तिं2बा2दे1
```

### Step 6: Test Locally

```bash
npm run dev
```

Open http://localhost:5173

---

## ☁️ Supabase Setup (Cloud Sync)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Sign up with GitHub
3. Create New Project
4. Wait for project to initialize

### Step 2: Get Credentials

From Project Settings > API:
- Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
- Copy **anon public** key

### Step 3: Create Tables

Go to SQL Editor and run:

```sql
-- User ratings
CREATE TABLE user_ratings (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL UNIQUE,
  rating_id INTEGER NOT NULL,
  rating_label TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wrong answers
CREATE TABLE wrong_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  wrong_answer_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Allow public access
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON user_ratings FOR ALL USING (true);
CREATE POLICY "Public access" ON wrong_answers FOR ALL USING (true);
```

### Step 4: Update App Config

In `src/App.jsx`, update:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',
  USE_SUPABASE: true,
  USE_LOCAL_STORAGE: true,
  // ...
};
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Easiest)

```bash
# Install Vercel
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts, then get your URL like:
# https://burmese-learning-app.vercel.app
```

### Option 2: GitHub Pages

1. Add to `package.json`:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/burmese-learning-app"
}
```

2. Install gh-pages:
```bash
npm install gh-pages --save-dev
```

3. Add scripts to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

### Option 3: Netlify

1. Build the project:
```bash
npm run build
```

2. Drag `dist` folder to https://app.netlify.com/drop

---

## 📝 Adding New Conversations

Edit `public/data/Burmese_Conversation.csv`:

```csv
Sr. No.,Tag,Burmese,English
1,Title,-,New Topic Name
2,Description,-,Description of the topic
3,Bot,ဗမာစကား,Burmese text here
4,User,ဗမာစကား,User response
5,Bot,ဗမာစကား,Bot continues
6,User,ဗမာစကား,User responds
7,End,---------,---------
```

**Tag options:**
- `Title` - Start of new topic
- `Description` - Topic description
- `Bot` - Chatbot message
- `User` - User response option
- `End` - End of topic

---

## 🔧 Adding Special Cases

When a word doesn't convert correctly:

1. Open `public/data/Special_cases.csv`
2. Add a row:
```csv
ပြဿနာ,प्यथ्थना2
```

3. Reload the app (Settings > Reload CSV Data)

---

## 📱 Make it a PWA (Installable App)

Create `public/manifest.json`:

```json
{
  "name": "Burmese Learn",
  "short_name": "BurmeseLearn",
  "description": "Learn Burmese with conversation practice",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#f59e0b",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f59e0b">
```

---

## ✅ Checklist

- [ ] Created React project
- [ ] Added App.jsx code
- [ ] Created public/data folder
- [ ] Added CSV files
- [ ] Tested locally (npm run dev)
- [ ] Created Supabase project (optional)
- [ ] Added Supabase credentials (optional)
- [ ] Deployed to Vercel/GitHub Pages
- [ ] Tested deployed version

---

## 🆘 Troubleshooting

### CSV files not loading
- Check file paths in CONFIG
- Make sure files are in `public/data/`
- Check browser console for errors

### Supabase not working
- Verify URL and key are correct
- Check if tables exist
- Look at Supabase logs

### Fonts not displaying
- Add to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar&family=Noto+Sans+Devanagari&display=swap" rel="stylesheet">
```

---

## 📞 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to GitHub Pages
npm run deploy
```

---

Happy learning! 🇲🇲 မင်္ဂလာပါ!
