# Burmese Learning Chatbot - Development Guide

## 📁 Current Data Structure

Your app uses **4 CSV files** for data:

### 1. Consonants.csv
Basic Burmese consonants → Devanagari mapping
```
Burmese,Marathi1,Marathi2,English
က,क,ग,k
ခ,ख,ग,kh
...
```

### 2. Vowels.csv
Burmese vowel markers → Devanagari mapping
```
English,Marathi,Marathi_extra,Burmese_extra,Vowels,Burmese_extra2,Marathi_extra2
a1,अ1,1,◌,,◌,1
a2,आ2,ा2,ာ,,ာ,ा2
...
```

### 3. Special_characters.csv
Consonant + Medial combinations (ျ ြ ှ ွ ွှ)
```
Burmese_extra,English,Marathi
ကျ,ch,च
ကြ,ch,च
ချ,chh,छ
...
```

### 4. Burmese_Conversation.csv
Conversation dialogues with tags
```
Sr. No.,Tag,Burmese,English
1,Title,-,Greeting 1
2,Description,-,Normal greeting to the friend
3,Bot,မင်္ဂလာပါ,Hello!
4,User,မင်္ဂလာပါ,Hello!
...
13,End,---------,---------
```

---

## 🏗️ App Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BURMESE CHATBOT                       │
├─────────────────────────────────────────────────────────────┤
│  📚 Learn    │  🎯 Quiz    │  📊 Review   │  🔧 Converter   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DATA LAYER                                                  │
│  ├── SPECIAL_CASES (word exceptions)                        │
│  ├── MEDIAL_COMBINATIONS (consonant+medial)                 │
│  ├── VOWELS (vowel markers)                                 │
│  ├── CONSONANTS (base consonants)                           │
│  └── CONVERSATIONS_DATA (dialogues)                         │
│                                                              │
│  CONVERSION ENGINE                                           │
│  └── Longest-match-first algorithm                          │
│      Priority: Special Cases → Medials → Vowels → Consonants│
│                                                              │
│  STATE MANAGEMENT                                            │
│  ├── messageRatings (rating per phrase)                     │
│  └── wrongAnswers (mistake tracking)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 How to Add New Data

### Adding New Conversations

Edit `Burmese_Conversation.csv`:

```csv
Sr. No.,Tag,Burmese,English
25,Title,-,At the Restaurant
26,Description,-,Ordering food at a restaurant
27,Bot,မင်္ဂလာပါ။ ဘာမှာမလဲ။,Hello. What would you like to order?
28,User,ထမင်းတစ်ပွဲပေးပါ။,One plate of rice please.
29,Bot,အချိုရည်ရော။,And a drink?
30,User,ရေတစ်ခွက်ပါ။,A glass of water please.
31,End,---------,---------
```

**Tags explained:**
- `Title` - Topic name (shown in topic selector)
- `Description` - Topic description
- `Bot` - Message from the chatbot
- `User` - User's response option
- `End` - Marks end of topic

### Adding Special Cases (Word Exceptions)

In the code, find `SPECIAL_CASES` and add:

```javascript
const SPECIAL_CASES = {
  'မင်္ဂလာပါ': 'मिं2ग1ला2बा2',
  'ကျေးဇူးတင်ပါတယ်': 'चे3जु2तिं2बा2दे1',  // Thank you
  // Add more exceptions here
};
```

### Adding Missing Characters

**For vowels** - Add to `Vowels.csv`:
```
newEnglish,newMarathi,newMarathiExtra,ဗမာ,,ဗမာ,newMarathiExtra
```

**For medials** - Add to `Special_characters.csv`:
```
ကျွ,chw,च्व
```

---

## 🔧 Conversion Logic Explained

### Priority Order (Longest Match First)

```
Input: "ကျွန်တော်"

Step 1: Check SPECIAL_CASES
        → No match for whole word

Step 2: Try longest patterns first
        "ကျွ" (3 chars) → Check MEDIAL_COMBINATIONS → No match
        "ကျ" (2 chars) → Check MEDIAL_COMBINATIONS → ✓ "च"
        
Step 3: Continue with remaining "ွန်တော်"
        "ွန်" → Check VOWELS → ✓ "ुन12"
        
Step 4: Continue...
        "တ" → Check CONSONANTS → ✓ "त"
        "ော်" → Check VOWELS → ✓ "ौ2"

Result: "चुन12तौ2"
```

### When Conversion is Wrong

1. **Check Converter tab** - See which character failed
2. **If character missing** - Add to appropriate CSV
3. **If whole word wrong** - Add to SPECIAL_CASES

---

## 🚀 Next Steps to Implement

### 1. Supabase Integration (Data Persistence)

```javascript
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Tables to create:
// - user_ratings (message_id, rating_id, created_at)
// - wrong_answers (question_id, wrong_answer_id, created_at)
// - user_progress (topic_id, completed, last_practiced)
```

### 2. Load Data from CSV Files

```javascript
// Using Papa Parse library
import Papa from 'papaparse';

const loadCSV = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  return Papa.parse(text, { header: true }).data;
};

// Load all data
const consonants = await loadCSV('/data/Consonants.csv');
const vowels = await loadCSV('/data/Vowels.csv');
const medials = await loadCSV('/data/Special_characters.csv');
const conversations = await loadCSV('/data/Burmese_Conversation.csv');
```

### 3. Spaced Repetition System

```javascript
// Based on ratings, calculate next review date
const getNextReviewDate = (rating) => {
  const intervals = {
    1: 30,  // Monthly Review → 30 days
    2: 7,   // Can't use in conversation → 7 days
    3: 3,   // Can't write → 3 days
    4: 1,   // Understand but can't use → 1 day
    5: 0,   // Don't know → same day
  };
  
  const days = intervals[rating.id];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};
```

### 4. Audio Pronunciation (Future)

```javascript
// Using Web Speech API or audio files
const playPronunciation = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'my'; // Burmese
  speechSynthesis.speak(utterance);
};
```

---

## 📊 Database Schema (For Supabase)

```sql
-- User ratings for each message
CREATE TABLE user_ratings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  message_id INTEGER NOT NULL,
  rating_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- Track wrong answers
CREATE TABLE wrong_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  question_id INTEGER NOT NULL,
  wrong_answer_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Topic progress
CREATE TABLE topic_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  topic_id INTEGER NOT NULL,
  completed_count INTEGER DEFAULT 0,
  last_practiced TIMESTAMP,
  UNIQUE(user_id, topic_id)
);

-- Special cases (user-contributed)
CREATE TABLE special_cases (
  id SERIAL PRIMARY KEY,
  burmese TEXT NOT NULL UNIQUE,
  devanagari TEXT NOT NULL,
  added_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### Problem: Character shows "⚠️ No match"
**Solution:** Add the character to appropriate CSV file or SPECIAL_CASES

### Problem: Wrong Devanagari for a word
**Solution:** Add entire word to SPECIAL_CASES with correct pronunciation

### Problem: Duplicate sentences in Quiz
**Solution:** Already fixed - deduplication by Burmese text

### Problem: Medial not converting correctly
**Solution:** Check if consonant+medial combination exists in Special_characters.csv

---

## 📱 Deployment Options

### GitHub Pages (Free)
```bash
# Build the app
npm run build

# Deploy to gh-pages branch
npm run deploy
```

### Vercel (Free)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### As PWA (Installable App)
Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

Create `manifest.json`:
```json
{
  "name": "Burmese Learn",
  "short_name": "BurmeseLearn",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#f59e0b",
  "background_color": "#1a1a2e",
  "icons": [...]
}
```

---

## 📞 Quick Reference

| Task | Location |
|------|----------|
| Add new topic | Burmese_Conversation.csv |
| Add word exception | SPECIAL_CASES in code |
| Add missing vowel | Vowels.csv |
| Add missing consonant | Consonants.csv |
| Add medial combination | Special_characters.csv |
| Test conversion | 🔧 Converter tab |
| View progress | 📊 Review tab |

---

## 🎯 Feature Checklist

- [x] Learn Mode with topic selection
- [x] Chat interface with Bot/User flow
- [x] Toggle for Devanagari/English
- [x] Wrong answer highlighting (red)
- [x] Quiz Mode - Easy (multiple choice)
- [x] Quiz Mode - Medium (type with hints)
- [x] Quiz Mode - Hard (reply in Burmese)
- [x] 5-level rating system
- [x] Review tab with rating filters
- [x] Converter debug tool
- [x] Special cases for exceptions
- [x] Medial consonant combinations
- [x] Deduplication of quiz questions
- [ ] Supabase integration
- [ ] Spaced repetition logic
- [ ] Audio pronunciation
- [ ] PWA support
- [ ] User authentication
- [ ] Progress sync across devices

---

Happy learning! 🇲🇲 မင်္ဂလာပါ!
