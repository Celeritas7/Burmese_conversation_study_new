# 🇲🇲 Burmese Learning Chatbot

Learn Burmese through interactive conversations with Devanagari pronunciation guide.

## Features

- 📚 **Learn Mode** - Practice conversations by topic
- 🎯 **Quiz Mode** - Test yourself at 3 difficulty levels
- 📊 **Review** - Track progress with 5-level rating system
- 🔧 **Converter** - Debug Burmese → Devanagari conversion
- ☁️ **Cloud Sync** - Optional Supabase integration

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Adding Conversations

Edit `public/data/Burmese_Conversation.csv`:

```csv
Sr. No.,Tag,Burmese,English
1,Title,-,Topic Name
2,Description,-,Topic description
3,Bot,မင်္ဂလာပါ,Hello!
4,User,မင်္ဂလာပါ,Hello!
5,End,---------,---------
```

## Adding Special Cases

Edit `public/data/Special_cases.csv`:

```csv
Burmese,Devanagari
မင်္ဂလာပါ,मिं2ग1ला2बा2
```

## Deployment

```bash
# Deploy to Vercel
npm i -g vercel
vercel

# Or build and deploy anywhere
npm run build
# Upload 'dist' folder
```

## License

MIT
