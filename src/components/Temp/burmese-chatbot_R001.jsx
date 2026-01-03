import React, { useState, useEffect, useRef } from 'react';

// ============================================
// DATA: Consonants Mapping (Burmese → Marathi)
// ============================================
const CONSONANTS = {
  'က': { marathi1: 'क', marathi2: 'ग', english: 'k' },
  'ခ': { marathi1: 'ख', marathi2: 'ग', english: 'kh' },
  'ဂ': { marathi1: 'ग', marathi2: '', english: '' },
  'ငြ': { marathi1: 'ग', marathi2: '', english: '' },
  'ဃ': { marathi1: 'घ', marathi2: '', english: 'gh' },
  'င': { marathi1: 'ङ', marathi2: '', english: 'ng' },
  'ဇ': { marathi1: 'ज', marathi2: '', english: 'j' },
  'ဈ': { marathi1: 'झ', marathi2: '', english: 'jh' },
  'ဋ': { marathi1: 'ट', marathi2: '', english: 'ṭ' },
  'ဌ': { marathi1: 'ठ', marathi2: '', english: 'ṭh' },
  'ဍ': { marathi1: 'ड', marathi2: '', english: 'ḍ' },
  'ဎ': { marathi1: 'ढ', marathi2: '', english: 'ḍh' },
  'ဏ': { marathi1: 'न', marathi2: '', english: 'ṇ' },
  'တ': { marathi1: 'त', marathi2: 'द', english: 't' },
  'ထ': { marathi1: 'थ', marathi2: 'द', english: 'th' },
  'သ': { marathi1: 'थ', marathi2: 'द', english: 'th' },
  'ဒ': { marathi1: 'द', marathi2: '', english: 'd' },
  'ဓ': { marathi1: 'ध', marathi2: '', english: 'dh' },
  'န': { marathi1: 'न', marathi2: '', english: 'n' },
  'ပ': { marathi1: 'प', marathi2: 'ब', english: 'p' },
  'ဖ': { marathi1: 'फ', marathi2: '', english: 'ph' },
  'ဗ': { marathi1: 'ब', marathi2: '', english: 'b' },
  'ဘ': { marathi1: 'ब', marathi2: '', english: 'bh' },
  'မ': { marathi1: 'म', marathi2: '', english: 'm' },
  'ယ': { marathi1: 'य', marathi2: 'र', english: 'y' },
  'ရ': { marathi1: 'य', marathi2: 'र', english: 'r' },
  'လ': { marathi1: 'ल', marathi2: '', english: 'l' },
  'ဠ': { marathi1: 'ल', marathi2: '', english: 'l' },
  'ဝ': { marathi1: 'व', marathi2: '', english: 'v' },
  'ရှ': { marathi1: 'श', marathi2: '', english: 'sh' },
  'စ': { marathi1: 'स', marathi2: 'झ', english: '' },
  'ဿ': { marathi1: 'स्स', marathi2: '', english: '' },
  'ဆ': { marathi1: 'स', marathi2: 'झ', english: 's' },
  'ဟ': { marathi1: 'ह', marathi2: '', english: 'h' },
  'ည': { marathi1: 'ज्ञ', marathi2: '', english: 'ñ' },
  'ဉ': { marathi1: 'ज्ञ', marathi2: '', english: 'ñ' },
  'အ': { marathi1: 'अ', marathi2: '', english: 'a' },
};

// ============================================
// DATA: Vowels Mapping (Burmese → Marathi)
// ============================================
const VOWELS = {
  '◌': { marathi: '1', marathiExtra: '1' },
  'ာ': { marathi: 'ा2', marathiExtra: 'ा2' },
  'ား': { marathi: 'ा3', marathiExtra: 'ा3' },
  'ိုင့်': { marathi: 'ाइन1', marathiExtra: 'ाइन1' },
  'ိုင်': { marathi: 'ाइन2', marathiExtra: 'ाइन2' },
  'ိုင်း': { marathi: 'ाइन3', marathiExtra: 'ाइन3' },
  'ိုက်': { marathi: 'ाइ', marathiExtra: 'ाइ' },
  'တ်': { marathi: 'त1', marathiExtra: 'त1' },
  'ပ်': { marathi: 'त2', marathiExtra: 'त2' },
  'ဒ်': { marathi: 'त3', marathiExtra: 'त3' },
  'ာတ်': { marathi: 'त4', marathiExtra: 'त4' },
  'ာသ်': { marathi: 'त5', marathiExtra: 'त5' },
  'ိ': { marathi: 'ि1', marathiExtra: 'ि1' },
  'ီ': { marathi: 'ि2', marathiExtra: 'ि2' },
  'ီး': { marathi: 'ि3', marathiExtra: 'ि3' },
  'င့်': { marathi: 'िन1', marathiExtra: 'िन1' },
  'င်': { marathi: 'िन2', marathiExtra: 'िन2' },
  'င်္': { marathi: 'िं2', marathiExtra: 'िं2' },
  'င်း': { marathi: 'िन3', marathiExtra: 'िन3' },
  'ဥ့်': { marathi: 'िन1', marathiExtra: 'िन1' },
  'ဉ်': { marathi: 'िन2', marathiExtra: 'िन2' },
  'ဥ်း': { marathi: 'िन3', marathiExtra: 'िन3' },
  'ေတ်': { marathi: 'े?1', marathiExtra: 'े?1' },
  'စ်': { marathi: 'े?2', marathiExtra: 'े?2' },
  'ု': { marathi: 'ु1', marathiExtra: 'ु1' },
  'ူ': { marathi: 'ु2', marathiExtra: 'ु2' },
  'ူး': { marathi: 'ु3', marathiExtra: 'ु3' },
  'ွန့်': { marathi: 'ुन11', marathiExtra: 'ुन11' },
  'ွန်': { marathi: 'ुन12', marathiExtra: 'ुन12' },
  'ွန်း': { marathi: 'ुन13', marathiExtra: 'ुन13' },
  'ွမ့်': { marathi: 'ुन21', marathiExtra: 'ुन21' },
  'ွမ်': { marathi: 'ुन22', marathiExtra: 'ुन22' },
  'ွမ်း': { marathi: 'ुन23', marathiExtra: 'ुन23' },
  'ွံ့': { marathi: 'ुन31', marathiExtra: 'ुन31' },
  'ွံ': { marathi: 'ुन32', marathiExtra: 'ुन32' },
  'ွံး': { marathi: 'ुन33', marathiExtra: 'ुन33' },
  'ွတ်': { marathi: 'ुत1', marathiExtra: 'ुत1' },
  'ွပ်': { marathi: 'ुत2', marathiExtra: 'ुत2' },
  'ေ့': { marathi: 'े11', marathiExtra: 'े11' },
  'ေ': { marathi: 'े2', marathiExtra: 'े2' },
  'ေး': { marathi: 'े3', marathiExtra: 'े3' },
  'ယ့်': { marathi: 'े³¹11', marathiExtra: 'े³¹11' },
  'ဲ့': { marathi: 'े³¹111', marathiExtra: 'े³¹111' },
  'ယ်': { marathi: 'े³¹12', marathiExtra: 'े³¹12' },
  'ဲ': { marathi: 'े³¹13', marathiExtra: 'े³¹13' },
  'ိန့်': { marathi: 'ेन11', marathiExtra: 'ेन11' },
  'ိန်': { marathi: 'ेन12', marathiExtra: 'ेन12' },
  'ိန်း': { marathi: 'ेन13', marathiExtra: 'ेन13' },
  'ိမ့်': { marathi: 'ेन21', marathiExtra: 'ेन21' },
  'ိမ်': { marathi: 'ेन22', marathiExtra: 'ेन22' },
  'ိမ်း': { marathi: 'ेन23', marathiExtra: 'ेन23' },
  'က်': { marathi: 'ेत', marathiExtra: 'ेत' },
  'ိတ်': { marathi: 'ै1', marathiExtra: 'ै1' },
  'ိပ်': { marathi: 'ै2', marathiExtra: 'ै2' },
  'ို့': { marathi: 'ो1', marathiExtra: 'ो1' },
  'ို': { marathi: 'ो2', marathiExtra: 'ो2' },
  'ိုး': { marathi: 'ोए', marathiExtra: 'ोए' },
  'ုန့်': { marathi: 'ों11', marathiExtra: 'ों11' },
  'ုန်': { marathi: 'ों12', marathiExtra: 'ों12' },
  'ုန်း': { marathi: 'ों13', marathiExtra: 'ों13' },
  'ုံ့': { marathi: 'ों21', marathiExtra: 'ों21' },
  'ုံ': { marathi: 'ों22', marathiExtra: 'ों22' },
  'ုံး': { marathi: 'ों23', marathiExtra: 'ों23' },
  'ုဏ့်': { marathi: 'ों31', marathiExtra: 'ों31' },
  'ုဏ်': { marathi: 'ों32', marathiExtra: 'ों32' },
  'ုဏ်း': { marathi: 'ों33', marathiExtra: 'ों33' },
  'ုတ်': { marathi: 'ोट', marathiExtra: 'ोट' },
  'ုပ်': { marathi: 'ोप', marathiExtra: 'ोप' },
  'ော့': { marathi: 'ौ1', marathiExtra: 'ौ1' },
  'ော်': { marathi: 'ौ2', marathiExtra: 'ौ2' },
  'ော': { marathi: 'ौ3', marathiExtra: 'ौ3' },
  'ောင့်': { marathi: 'ौं1', marathiExtra: 'ौं1' },
  'ောင်': { marathi: 'ौं2', marathiExtra: 'ौं2' },
  'ောင်း': { marathi: 'ौं3', marathiExtra: 'ौं3' },
  'ောက်': { marathi: 'ौ?1', marathiExtra: 'ौ?1' },
  'န့်': { marathi: 'ं11', marathiExtra: 'ं11' },
  'န်': { marathi: 'ं12', marathiExtra: 'ं12' },
  'န်း': { marathi: 'ं13', marathiExtra: 'ं13' },
  'မ့်': { marathi: 'ं21', marathiExtra: 'ं21' },
  'မ်': { marathi: 'ं22', marathiExtra: 'ं22' },
  'မ်း': { marathi: 'ं23', marathiExtra: 'ं23' },
  'ံ့': { marathi: 'ं31', marathiExtra: 'ं31' },
  'ံ': { marathi: 'ं32', marathiExtra: 'ं32' },
  'ဏ်': { marathi: 'ं4', marathiExtra: 'ं4' },
  'ျ': { marathi: '्य', marathiExtra: '्य' },
  'ြ': { marathi: '्य', marathiExtra: '्य' },
  'ှ': { marathi: '्ह', marathiExtra: '्ह' },
  'ွ': { marathi: '्व', marathiExtra: '्व' },
  'ွှ': { marathi: '्व', marathiExtra: '्व' },
  '။': { marathi: '॥', marathiExtra: '॥' },
  '၊': { marathi: '।', marathiExtra: '।' },
};

// ============================================
// DATA: Conversations
// ============================================
const CONVERSATIONS_DATA = [
  { srNo: 1, tag: 'Title', burmese: '-', english: 'Greeting 1' },
  { srNo: 2, tag: 'Description', burmese: '-', english: 'Normal greeting to the friend' },
  { srNo: 3, tag: 'Bot', burmese: 'မင်္ဂလာပါ', english: 'Hello!' },
  { srNo: 4, tag: 'User', burmese: 'မင်္ဂလာပါ', english: 'Hello!' },
  { srNo: 5, tag: 'Bot', burmese: 'နေကောင်းလား။', english: 'How are you?' },
  { srNo: 6, tag: 'User', burmese: 'ကောင်းပါတယ်။ သင်လည်းနေကောင်းလား။', english: "I'm fine. How about you?" },
  { srNo: 7, tag: 'Bot', burmese: 'ကျွန်တော်လည်းကောင်းပါတယ်။', english: "I'm fine too." },
  { srNo: 8, tag: 'User', burmese: 'ဒါကောင်းတယ်။', english: "That's good." },
  { srNo: 9, tag: 'Bot', burmese: 'ဒီနေ့ဘာလုပ်နေလဲ။', english: 'What are you doing today?' },
  { srNo: 10, tag: 'User', burmese: 'အိမ်မှာနေမယ်။', english: "I'll be at home." },
  { srNo: 11, tag: 'Bot', burmese: 'စားပွဲတင်မယ်ဆိုရင်ခေါ်ပါ။', english: "Call me if you're going to eat." },
  { srNo: 12, tag: 'User', burmese: 'ဟုတ်ကဲ့၊ မင်္ဂလာပါ။', english: 'Okay, thank you.' },
  { srNo: 13, tag: 'End', burmese: '---------', english: '---------' },
  { srNo: 14, tag: 'Title', burmese: '', english: 'Offering tea' },
  { srNo: 15, tag: 'Description', burmese: '', english: 'Offering tea to a guest' },
  { srNo: 16, tag: 'Bot', burmese: 'မင်္ဂလာပါ', english: 'Hello!' },
  { srNo: 17, tag: 'User', burmese: 'လက်ဖက်ရည်သောက်ချင်လား။', english: 'Would you like some tea?' },
  { srNo: 18, tag: 'Bot', burmese: 'အခုတင်ဖက်ရည်ပြင်တယ်။', english: 'I just made some.' },
  { srNo: 19, tag: 'User', burmese: 'သောက်ပါ။', english: 'Please have some.' },
  { srNo: 20, tag: 'Bot', burmese: 'သကြားထည့်မလား။', english: 'Do you take sugar?' },
  { srNo: 21, tag: 'User', burmese: 'နို့လည်းထည့်မလား။', english: 'Or milk?' },
  { srNo: 22, tag: 'Bot', burmese: 'ဒီမှာပါ။', english: 'Here you go.' },
  { srNo: 23, tag: 'User', burmese: 'သင်ကြိုက်မယ်လို့မျှော်လင့်ပါတယ်။', english: 'I hope you like it.' },
  { srNo: 24, tag: 'End', burmese: '---------', english: '---------' },
];

// ============================================
// CONVERTER: Burmese to Devanagari
// ============================================
const buildLookupTable = () => {
  const lookup = {};
  
  // Add vowels (these are often longer patterns)
  Object.entries(VOWELS).forEach(([burmese, data]) => {
    if (burmese && burmese !== '◌') {
      lookup[burmese] = data.marathi;
    }
  });
  
  // Add consonants
  Object.entries(CONSONANTS).forEach(([burmese, data]) => {
    if (burmese) {
      lookup[burmese] = data.marathi1;
    }
  });
  
  return lookup;
};

const LOOKUP_TABLE = buildLookupTable();

// Get all patterns sorted by length (longest first) for greedy matching
const getSortedPatterns = () => {
  return Object.keys(LOOKUP_TABLE).sort((a, b) => b.length - a.length);
};

const SORTED_PATTERNS = getSortedPatterns();

const convertBurmeseToDevanagari = (burmeseText) => {
  if (!burmeseText || burmeseText === '-' || burmeseText === '---------') {
    return '';
  }
  
  let result = '';
  let remaining = burmeseText.trim();
  
  while (remaining.length > 0) {
    let matched = false;
    
    // Try to match longest pattern first
    for (const pattern of SORTED_PATTERNS) {
      if (remaining.startsWith(pattern)) {
        result += LOOKUP_TABLE[pattern];
        remaining = remaining.slice(pattern.length);
        matched = true;
        break;
      }
    }
    
    // If no pattern matched, keep the character as-is and move on
    if (!matched) {
      const char = remaining[0];
      // Skip spaces and keep punctuation
      if (char === ' ') {
        result += ' ';
      } else if (char === '၊') {
        result += '।';
      } else if (char === '။') {
        result += '॥';
      } else {
        result += char;
      }
      remaining = remaining.slice(1);
    }
  }
  
  return result;
};

// ============================================
// PARSER: Group conversations by topic
// ============================================
const parseConversations = (data) => {
  const topics = [];
  let currentTopic = null;
  
  for (const row of data) {
    if (row.tag === 'Title') {
      if (currentTopic) {
        topics.push(currentTopic);
      }
      currentTopic = {
        id: topics.length + 1,
        title: row.english,
        description: '',
        messages: [],
      };
    } else if (row.tag === 'Description' && currentTopic) {
      currentTopic.description = row.english;
    } else if ((row.tag === 'Bot' || row.tag === 'User') && currentTopic) {
      currentTopic.messages.push({
        id: row.srNo,
        role: row.tag.toLowerCase(),
        burmese: row.burmese.trim(),
        english: row.english,
        devanagari: convertBurmeseToDevanagari(row.burmese),
      });
    } else if (row.tag === 'End' && currentTopic) {
      topics.push(currentTopic);
      currentTopic = null;
    }
  }
  
  if (currentTopic) {
    topics.push(currentTopic);
  }
  
  return topics;
};

const TOPICS = parseConversations(CONVERSATIONS_DATA);

// ============================================
// RATING SYSTEM
// ============================================
const RATINGS = [
  { id: 1, emoji: '✓', label: 'Monthly Review', description: 'You know this word well', color: '#22c55e' },
  { id: 2, emoji: '💬', label: "Can't use in conversation", description: 'Understand but can\'t speak it', color: '#3b82f6' },
  { id: 3, emoji: '✍', label: "Can't write in Burmese", description: 'Know meaning but can\'t write', color: '#f59e0b' },
  { id: 4, emoji: '🤔', label: "Understand but can't use", description: "Hear & understand, but don't know when to use", color: '#a855f7' },
  { id: 5, emoji: '❌', label: "Don't know at all", description: 'Need to learn from scratch', color: '#ef4444' },
];

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    fontFamily: "'Noto Sans Myanmar', 'Noto Sans Devanagari', 'Segoe UI', sans-serif",
    color: '#e2e8f0',
  },
  header: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navTabs: {
    display: 'flex',
    gap: '8px',
  },
  navTab: {
    padding: '8px 20px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navTabActive: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    color: 'white',
  },
  navTabInactive: {
    background: 'rgba(255,255,255,0.1)',
    color: '#94a3b8',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
  },
  topicSelector: {
    marginBottom: '24px',
  },
  topicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  topicCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '2px solid transparent',
  },
  topicCardHover: {
    background: 'rgba(255,255,255,0.12)',
    border: '2px solid rgba(245, 158, 11, 0.5)',
    transform: 'translateY(-2px)',
  },
  topicTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  topicDesc: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  chatContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  chatHeader: {
    background: 'rgba(255,255,255,0.08)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  chatTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  messagesArea: {
    padding: '20px',
    minHeight: '400px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: '16px',
    animation: 'fadeIn 0.3s ease-out',
  },
  botBubble: {
    marginRight: 'auto',
  },
  userBubble: {
    marginLeft: 'auto',
  },
  bubbleContent: {
    padding: '14px 18px',
    borderRadius: '18px',
    position: 'relative',
  },
  botBubbleContent: {
    background: 'rgba(59, 130, 246, 0.2)',
    borderBottomLeftRadius: '4px',
  },
  userBubbleContent: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    borderBottomRightRadius: '4px',
  },
  burmeseText: {
    fontSize: '20px',
    lineHeight: '1.6',
    marginBottom: '4px',
  },
  toggleBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  hiddenContent: {
    marginTop: '10px',
    padding: '10px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    fontSize: '14px',
  },
  devanagariText: {
    color: '#fbbf24',
    marginBottom: '4px',
  },
  englishText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  responseOptions: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
  },
  optionBtn: {
    width: '100%',
    padding: '14px 18px',
    marginBottom: '10px',
    background: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: '18px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  optionBtnHover: {
    background: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  quizContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  difficultySelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    justifyContent: 'center',
  },
  difficultyBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  quizCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '30px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  quizBurmese: {
    fontSize: '32px',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  quizHint: {
    background: 'rgba(0,0,0,0.3)',
    padding: '16px',
    borderRadius: '12px',
    marginTop: '16px',
  },
  quizInput: {
    width: '100%',
    padding: '16px',
    fontSize: '20px',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    textAlign: 'center',
    marginTop: '16px',
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
  ratingBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.08)',
    border: '2px solid transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#e2e8f0',
    fontSize: '14px',
  },
  ratingEmoji: {
    fontSize: '24px',
  },
  ratingLabel: {
    fontWeight: '600',
  },
  ratingDesc: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  completionMessage: {
    textAlign: 'center',
    padding: '40px',
  },
  completionIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  completionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  completionSubtitle: {
    color: '#94a3b8',
  },
  restartBtn: {
    marginTop: '24px',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

// ============================================
// COMPONENTS
// ============================================

// Message Bubble Component
const MessageBubble = ({ message, isBot }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div style={{
      ...styles.messageBubble,
      ...(isBot ? styles.botBubble : styles.userBubble),
    }}>
      <div style={{
        ...styles.bubbleContent,
        ...(isBot ? styles.botBubbleContent : styles.userBubbleContent),
      }}>
        <div style={styles.burmeseText}>{message.burmese}</div>
        <button
          style={styles.toggleBtn}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▲ Hide' : '▼ Show pronunciation & meaning'}
        </button>
        {showDetails && (
          <div style={styles.hiddenContent}>
            <div style={styles.devanagariText}>🔊 {message.devanagari || 'N/A'}</div>
            <div style={styles.englishText}>📝 {message.english}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Topic Selector Component
const TopicSelector = ({ topics, onSelect }) => {
  const [hoveredId, setHoveredId] = useState(null);
  
  return (
    <div style={styles.topicSelector}>
      <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>📚 Choose a topic to practice:</h2>
      <div style={styles.topicGrid}>
        {topics.map((topic) => (
          <div
            key={topic.id}
            style={{
              ...styles.topicCard,
              ...(hoveredId === topic.id ? styles.topicCardHover : {}),
            }}
            onClick={() => onSelect(topic)}
            onMouseEnter={() => setHoveredId(topic.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={styles.topicTitle}>{topic.title}</div>
            <div style={styles.topicDesc}>{topic.description || 'Practice conversation'}</div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
              {topic.messages.length} messages
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chat View Component
const ChatView = ({ topic, onBack, onComplete }) => {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [responseOptions, setResponseOptions] = useState([]);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages]);
  
  useEffect(() => {
    // Start conversation
    if (topic.messages.length > 0) {
      showNextMessage(0);
    }
  }, [topic]);
  
  const showNextMessage = (index) => {
    if (index >= topic.messages.length) {
      // Conversation complete
      setTimeout(() => onComplete(), 1000);
      return;
    }
    
    const msg = topic.messages[index];
    
    if (msg.role === 'bot') {
      // Show bot message with delay
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
        setCurrentIndex(index + 1);
        
        // Check if next message is a user response
        if (index + 1 < topic.messages.length && topic.messages[index + 1].role === 'user') {
          // Prepare response options
          const correctResponse = topic.messages[index + 1];
          const otherResponses = topic.messages
            .filter((m, i) => m.role === 'user' && i !== index + 1)
            .slice(0, 2);
          
          const options = [correctResponse, ...otherResponses]
            .sort(() => Math.random() - 0.5);
          
          setResponseOptions(options);
          setWaitingForResponse(true);
        } else {
          // Continue to next message
          showNextMessage(index + 1);
        }
      }, 800);
    }
  };
  
  const handleResponseSelect = (selectedMsg) => {
    const correctMsg = topic.messages[currentIndex];
    
    // Add user message
    setVisibleMessages(prev => [...prev, correctMsg]);
    setWaitingForResponse(false);
    setResponseOptions([]);
    
    // Continue conversation
    setTimeout(() => {
      showNextMessage(currentIndex + 1);
    }, 500);
  };
  
  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <div style={styles.chatTitle}>💬 {topic.title}</div>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
      </div>
      
      <div style={styles.messagesArea}>
        {visibleMessages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            isBot={msg.role === 'bot'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {waitingForResponse && (
        <div style={styles.responseOptions}>
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#94a3b8' }}>
            Choose your response:
          </div>
          {responseOptions.map((opt, idx) => (
            <button
              key={idx}
              style={styles.optionBtn}
              onClick={() => handleResponseSelect(opt)}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(245, 158, 11, 0.2)';
                e.target.style.borderColor = '#f59e0b';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.08)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              {opt.burmese}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Quiz View Component
const QuizView = ({ topics }) => {
  const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [quizMessages, setQuizMessages] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showRating, setShowRating] = useState(false);
  
  // Gather all messages for quiz
  useEffect(() => {
    const allMsgs = topics.flatMap(t => t.messages);
    const shuffled = [...allMsgs].sort(() => Math.random() - 0.5);
    setQuizMessages(shuffled);
    if (shuffled.length > 0) {
      setCurrentQuestion(shuffled[0]);
    }
  }, [topics]);
  
  const difficulties = [
    { id: 'easy', label: '📖 Easy', desc: 'Multiple choice', color: '#22c55e' },
    { id: 'medium', label: '✍️ Medium', desc: 'Type with hints', color: '#f59e0b' },
    { id: 'hard', label: '🔥 Hard', desc: 'Type from memory', color: '#ef4444' },
  ];
  
  const handleNext = () => {
    setShowAnswer(false);
    setUserInput('');
    setShowRating(false);
    
    const nextIdx = currentIdx + 1;
    if (nextIdx < quizMessages.length) {
      setCurrentIdx(nextIdx);
      setCurrentQuestion(quizMessages[nextIdx]);
    } else {
      // Restart quiz
      const shuffled = [...quizMessages].sort(() => Math.random() - 0.5);
      setQuizMessages(shuffled);
      setCurrentIdx(0);
      setCurrentQuestion(shuffled[0]);
    }
  };
  
  const handleReveal = () => {
    setShowAnswer(true);
    setShowRating(true);
  };
  
  const handleRating = (rating) => {
    // In a real app, save to Supabase here
    console.log('Rating:', rating, 'for message:', currentQuestion);
    handleNext();
  };
  
  const getResponseOptions = () => {
    if (!currentQuestion) return [];
    const others = quizMessages
      .filter(m => m.id !== currentQuestion.id)
      .slice(0, 3);
    return [currentQuestion, ...others].sort(() => Math.random() - 0.5);
  };
  
  if (!currentQuestion) {
    return <div>Loading quiz...</div>;
  }
  
  return (
    <div style={styles.quizContainer}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>🎯 Quiz Mode</h2>
      
      {/* Difficulty Selector */}
      <div style={styles.difficultySelector}>
        {difficulties.map((d) => (
          <button
            key={d.id}
            style={{
              ...styles.difficultyBtn,
              borderColor: difficulty === d.id ? d.color : 'rgba(255,255,255,0.2)',
              background: difficulty === d.id ? `${d.color}20` : 'transparent',
              color: difficulty === d.id ? d.color : '#94a3b8',
            }}
            onClick={() => setDifficulty(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>
      
      {/* Quiz Card */}
      <div style={styles.quizCard}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
          Question {currentIdx + 1} of {quizMessages.length}
        </div>
        
        {/* Show Burmese text */}
        <div style={styles.quizBurmese}>
          {currentQuestion.burmese}
        </div>
        
        {/* Medium difficulty: Show hints */}
        {difficulty === 'medium' && !showAnswer && (
          <div style={styles.quizHint}>
            <div style={{ color: '#fbbf24', marginBottom: '8px' }}>
              🔊 {currentQuestion.devanagari}
            </div>
            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
              📝 {currentQuestion.english}
            </div>
          </div>
        )}
        
        {/* Easy mode: Multiple choice */}
        {difficulty === 'easy' && !showAnswer && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>
              What does this mean?
            </div>
            {getResponseOptions().map((opt, idx) => (
              <button
                key={idx}
                style={{
                  ...styles.optionBtn,
                  marginBottom: '8px',
                }}
                onClick={() => {
                  if (opt.id === currentQuestion.id) {
                    setShowAnswer(true);
                    setShowRating(true);
                  }
                }}
              >
                {opt.english}
              </button>
            ))}
          </div>
        )}
        
        {/* Medium/Hard mode: Text input */}
        {(difficulty === 'medium' || difficulty === 'hard') && !showAnswer && (
          <div>
            {difficulty === 'hard' && (
              <div style={{ color: '#94a3b8', marginBottom: '12px' }}>
                Type the meaning in English:
              </div>
            )}
            <input
              type="text"
              style={styles.quizInput}
              placeholder={difficulty === 'medium' ? 'Type in Burmese...' : 'Type the meaning...'}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleReveal();
              }}
            />
            <button
              style={{ ...styles.restartBtn, marginTop: '16px' }}
              onClick={handleReveal}
            >
              Check Answer
            </button>
          </div>
        )}
        
        {/* Show Answer */}
        {showAnswer && (
          <div style={styles.quizHint}>
            <div style={{ color: '#22c55e', marginBottom: '8px', fontWeight: '600' }}>
              ✓ Answer:
            </div>
            <div style={{ color: '#fbbf24', marginBottom: '8px', fontSize: '18px' }}>
              🔊 {currentQuestion.devanagari}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '16px' }}>
              📝 {currentQuestion.english}
            </div>
          </div>
        )}
      </div>
      
      {/* Rating Buttons */}
      {showRating && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '16px', color: '#94a3b8' }}>
            How well did you know this?
          </div>
          <div style={styles.ratingContainer}>
            {RATINGS.map((rating) => (
              <button
                key={rating.id}
                style={{
                  ...styles.ratingBtn,
                  borderColor: 'transparent',
                }}
                onClick={() => handleRating(rating)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = rating.color;
                  e.currentTarget.style.background = `${rating.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
              >
                <span style={styles.ratingEmoji}>{rating.emoji}</span>
                <div>
                  <div style={styles.ratingLabel}>{rating.label}</div>
                  <div style={styles.ratingDesc}>{rating.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Completion Screen
const CompletionScreen = ({ topic, onRestart, onBack }) => (
  <div style={styles.completionMessage}>
    <div style={styles.completionIcon}>🎉</div>
    <div style={styles.completionTitle}>Conversation Complete!</div>
    <div style={styles.completionSubtitle}>
      You finished "{topic.title}"
    </div>
    <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
      <button style={styles.restartBtn} onClick={onRestart}>
        🔄 Practice Again
      </button>
      <button
        style={{ ...styles.restartBtn, background: 'rgba(255,255,255,0.1)' }}
        onClick={onBack}
      >
        ← Choose Topic
      </button>
    </div>
  </div>
);

// ============================================
// MAIN APP
// ============================================
export default function BurmeseChatbot() {
  const [mode, setMode] = useState('learn'); // learn, quiz
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>မြ</div>
          <div style={styles.logoText}>Burmese Learn</div>
        </div>
        
        <nav style={styles.navTabs}>
          <button
            style={{
              ...styles.navTab,
              ...(mode === 'learn' ? styles.navTabActive : styles.navTabInactive),
            }}
            onClick={() => {
              setMode('learn');
              setSelectedTopic(null);
              setIsComplete(false);
            }}
          >
            📚 Learn
          </button>
          <button
            style={{
              ...styles.navTab,
              ...(mode === 'quiz' ? styles.navTabActive : styles.navTabInactive),
            }}
            onClick={() => {
              setMode('quiz');
              setSelectedTopic(null);
              setIsComplete(false);
            }}
          >
            🎯 Quiz
          </button>
        </nav>
      </header>
      
      {/* Main Content */}
      <main style={styles.main}>
        {mode === 'learn' && (
          <>
            {!selectedTopic && (
              <TopicSelector
                topics={TOPICS}
                onSelect={(topic) => {
                  setSelectedTopic(topic);
                  setIsComplete(false);
                }}
              />
            )}
            
            {selectedTopic && !isComplete && (
              <ChatView
                topic={selectedTopic}
                onBack={() => setSelectedTopic(null)}
                onComplete={() => setIsComplete(true)}
              />
            )}
            
            {selectedTopic && isComplete && (
              <CompletionScreen
                topic={selectedTopic}
                onRestart={() => {
                  setIsComplete(false);
                  setSelectedTopic({ ...selectedTopic });
                }}
                onBack={() => {
                  setSelectedTopic(null);
                  setIsComplete(false);
                }}
              />
            )}
          </>
        )}
        
        {mode === 'quiz' && (
          <QuizView topics={TOPICS} />
        )}
      </main>
      
      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: '#64748b',
        fontSize: '12px',
      }}>
        Built for Burmese language learning • Devanagari conversion included
      </footer>
    </div>
  );
}
