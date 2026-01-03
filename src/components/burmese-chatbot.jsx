import React, { useState, useEffect, useRef } from 'react';

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CONFIG = {
  // Supabase Configuration (Get from: https://supabase.com/dashboard)
  SUPABASE_URL: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxx.supabase.co'
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY', // e.g., 'eyJhbGc...'
  
  // CSV File Paths (relative to public folder or full URLs)
  CSV_PATHS: {
    consonants: './data/Consonants.csv',
    vowels: './data/Vowels.csv',
    medials: './data/Special_characters.csv',
    conversations: './data/Burmese_Conversation.csv',
    specialCases: './data/Special_cases.csv', // Optional
  },
  
  // Enable/Disable features
  USE_SUPABASE: false, // Set to true when Supabase is configured
  USE_LOCAL_STORAGE: true, // Fallback when Supabase is disabled
};

// ============================================
// SUPABASE CLIENT (Lightweight implementation)
// ============================================
const createSupabaseClient = (url, key) => {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  
  return {
    from: (table) => ({
      select: async (columns = '*') => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}?select=${columns}`, { headers });
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      insert: async (records) => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(records),
          });
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      upsert: async (records) => {
        try {
          const response = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify(records),
          });
          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      delete: async () => ({
        eq: async (column, value) => {
          try {
            const response = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
              method: 'DELETE',
              headers,
            });
            return { error: null };
          } catch (error) {
            return { error };
          }
        }
      }),
    }),
  };
};

const supabase = CONFIG.USE_SUPABASE 
  ? createSupabaseClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  : null;

// ============================================
// CSV PARSER (No external dependency)
// ============================================
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  // Remove BOM if present
  let headerLine = lines[0];
  if (headerLine.charCodeAt(0) === 0xFEFF) {
    headerLine = headerLine.slice(1);
  }
  
  const headers = headerLine.split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Handle quoted values with commas
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }
  
  return data;
};

const loadCSV = async (path) => {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error(`Error loading CSV from ${path}:`, error);
    return null;
  }
};

// ============================================
// DATA STORAGE SERVICE
// ============================================
const StorageService = {
  // Save rating for a message
  saveRating: async (messageId, rating) => {
    const record = {
      message_id: messageId,
      rating_id: rating.id,
      rating_label: rating.label,
      updated_at: new Date().toISOString(),
    };
    
    if (CONFIG.USE_SUPABASE && supabase) {
      const { error } = await supabase.from('user_ratings').upsert([record]);
      if (error) console.error('Supabase error:', error);
    }
    
    if (CONFIG.USE_LOCAL_STORAGE) {
      const ratings = JSON.parse(localStorage.getItem('burmese_ratings') || '{}');
      ratings[messageId] = record;
      localStorage.setItem('burmese_ratings', JSON.stringify(ratings));
    }
    
    return record;
  },
  
  // Load all ratings
  loadRatings: async () => {
    if (CONFIG.USE_SUPABASE && supabase) {
      const { data, error } = await supabase.from('user_ratings').select('*');
      if (!error && data) {
        const ratings = {};
        data.forEach(r => { ratings[r.message_id] = r; });
        return ratings;
      }
    }
    
    if (CONFIG.USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('burmese_ratings') || '{}');
    }
    
    return {};
  },
  
  // Save wrong answer
  saveWrongAnswer: async (questionId, wrongAnswerId) => {
    const record = {
      question_id: questionId,
      wrong_answer_id: wrongAnswerId,
      created_at: new Date().toISOString(),
    };
    
    if (CONFIG.USE_SUPABASE && supabase) {
      await supabase.from('wrong_answers').insert([record]);
    }
    
    if (CONFIG.USE_LOCAL_STORAGE) {
      const wrongs = JSON.parse(localStorage.getItem('burmese_wrong_answers') || '[]');
      wrongs.push(record);
      localStorage.setItem('burmese_wrong_answers', JSON.stringify(wrongs));
    }
    
    return record;
  },
  
  // Load wrong answers
  loadWrongAnswers: async () => {
    if (CONFIG.USE_SUPABASE && supabase) {
      const { data, error } = await supabase.from('wrong_answers').select('*');
      if (!error && data) return data;
    }
    
    if (CONFIG.USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('burmese_wrong_answers') || '[]');
    }
    
    return [];
  },
  
  // Clear all data
  clearAll: async () => {
    if (CONFIG.USE_LOCAL_STORAGE) {
      localStorage.removeItem('burmese_ratings');
      localStorage.removeItem('burmese_wrong_answers');
    }
  },
};

// ============================================
// DEFAULT DATA (Fallback when CSVs not loaded)
// ============================================
const DEFAULT_CONSONANTS = {
  'က': { marathi1: 'क', marathi2: 'ग', english: 'k' },
  'ခ': { marathi1: 'ख', marathi2: 'ग', english: 'kh' },
  'ဂ': { marathi1: 'ग', marathi2: '', english: 'g' },
  'ဃ': { marathi1: 'घ', marathi2: '', english: 'gh' },
  'င': { marathi1: 'ङ', marathi2: '', english: 'ng' },
  'စ': { marathi1: 'स', marathi2: 'झ', english: 's' },
  'ဆ': { marathi1: 'स', marathi2: 'झ', english: 's' },
  'ဇ': { marathi1: 'ज', marathi2: '', english: 'j' },
  'ဈ': { marathi1: 'झ', marathi2: '', english: 'jh' },
  'ည': { marathi1: 'ज्ञ', marathi2: '', english: 'ñ' },
  'ဉ': { marathi1: 'ज्ञ', marathi2: '', english: 'ñ' },
  'ဋ': { marathi1: 'ट', marathi2: '', english: 'ṭ' },
  'ဌ': { marathi1: 'ठ', marathi2: '', english: 'ṭh' },
  'ဍ': { marathi1: 'ड', marathi2: '', english: 'ḍ' },
  'ဎ': { marathi1: 'ढ', marathi2: '', english: 'ḍh' },
  'ဏ': { marathi1: 'न', marathi2: '', english: 'ṇ' },
  'တ': { marathi1: 'त', marathi2: 'द', english: 't' },
  'ထ': { marathi1: 'थ', marathi2: 'द', english: 'th' },
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
  'ဝ': { marathi1: 'व', marathi2: '', english: 'w' },
  'သ': { marathi1: 'थ', marathi2: 'द', english: 'th' },
  'ဟ': { marathi1: 'ह', marathi2: '', english: 'h' },
  'ဠ': { marathi1: 'ल', marathi2: '', english: 'l' },
  'အ': { marathi1: 'अ', marathi2: '', english: 'a' },
  'ဿ': { marathi1: 'स्स', marathi2: '', english: 'ss' },
};

const DEFAULT_VOWELS = {
  'ါ': { marathi: 'ा2' },
  'ာ': { marathi: 'ा2' },
  'ား': { marathi: 'ा3' },
  'ိ': { marathi: 'ि1' },
  'ီ': { marathi: 'ि2' },
  'ီး': { marathi: 'ि3' },
  'ု': { marathi: 'ु1' },
  'ူ': { marathi: 'ु2' },
  'ူး': { marathi: 'ु3' },
  'ေ': { marathi: 'े2' },
  'ေး': { marathi: 'े3' },
  'ဲ': { marathi: 'े³¹13' },
  'ော': { marathi: 'ौ3' },
  'ော်': { marathi: 'ौ2' },
  'ို': { marathi: 'ो2' },
  'ို့': { marathi: 'ो1' },
  'ိုး': { marathi: 'ोए' },
  'ောင်': { marathi: 'ौं2' },
  'ောင်း': { marathi: 'ौं3' },
  'ောက်': { marathi: 'ौ?1' },
  'ိုင်': { marathi: 'ाइन2' },
  'ိုင်း': { marathi: 'ाइन3' },
  'ိုက်': { marathi: 'ाइ' },
  'င်': { marathi: 'िन2' },
  'င်း': { marathi: 'िन3' },
  'င့်': { marathi: 'िन1' },
  'င်္': { marathi: 'िं2' },
  'န်': { marathi: 'ं12' },
  'န်း': { marathi: 'ं13' },
  'မ်': { marathi: 'ं22' },
  'မ်း': { marathi: 'ं23' },
  'ံ': { marathi: 'ं32' },
  'ံ့': { marathi: 'ं31' },
  'က်': { marathi: 'ेत' },
  'တ်': { marathi: 'त1' },
  'ပ်': { marathi: 'त2' },
  'ယ်': { marathi: 'े³¹12' },
  'ည်': { marathi: 'े³¹22' },
  'ုတ်': { marathi: 'ोट' },
  'ုပ်': { marathi: 'ोप' },
  'ုန်': { marathi: 'ों12' },
  'ုံ': { marathi: 'ों22' },
  '။': { marathi: '॥' },
  '၊': { marathi: '।' },
  'ျ': { marathi: '्य' },
  'ြ': { marathi: '्य' },
  'ှ': { marathi: '्ह' },
  'ွ': { marathi: '्व' },
};

const DEFAULT_MEDIALS = {
  'ကျ': 'च', 'ကြ': 'च', 'ကှ': 'क्ह', 'ကွ': 'क्व', 'ကွှ': 'क्हव',
  'ချ': 'छ', 'ခြ': 'छ', 'ခှ': 'ख्ह', 'ခွ': 'ख्व', 'ခွှ': 'ख्हव',
  'ဂျ': 'ज', 'ဂြ': 'ज', 'ဂှ': 'ग्ह', 'ဂွ': 'ग्व', 'ဂွှ': 'ग्हव',
  'ငျ': 'ङ्य', 'ငြ': 'ज्ञ', 'ငှ': 'ङ्ह', 'ငွ': 'ङ्व', 'ငွှ': 'ङ्हव',
  'စျ': 'स्य', 'စြ': 'स्य', 'စှ': 'स्ह', 'စွ': 'स्व', 'စွှ': 'स्हव',
  'ဆျ': 'स्य', 'ဆြ': 'स्य', 'ဆှ': 'स्ह', 'ဆွ': 'स्व', 'ဆွှ': 'स्हव',
  'ဇျ': 'ज्य', 'ဇြ': 'ज्य', 'ဇှ': 'ज्ह', 'ဇွ': 'ज्व', 'ဇွှ': 'ज्हव',
  'ညျ': 'ज्ञ्य', 'ညြ': 'ज्ञ्य', 'ညှ': 'ज्ञ्ह', 'ညွ': 'ज्ञ्व', 'ညွှ': 'ज्ञ्हव',
  'တျ': 'त्य', 'တြ': 'त्य', 'တှ': 'त्ह', 'တွ': 'त्व', 'တွှ': 'त्हव',
  'ထျ': 'थ्य', 'ထြ': 'थ्य', 'ထှ': 'थ्ह', 'ထွ': 'थ्व', 'ထွှ': 'थ्हव',
  'ဒျ': 'द्य', 'ဒြ': 'द्य', 'ဒှ': 'द्ह', 'ဒွ': 'द्व', 'ဒွှ': 'द्हव',
  'နျ': 'न्य', 'နြ': 'न्य', 'နှ': 'न्ह', 'နွ': 'न्व', 'နွှ': 'न्हव',
  'ပျ': 'प्य', 'ပြ': 'प्य', 'ပှ': 'प्ह', 'ပွ': 'प्व', 'ပွှ': 'प्हव',
  'ဖျ': 'फ्य', 'ဖြ': 'फ्य', 'ဖှ': 'फ्ह', 'ဖွ': 'फ्व', 'ဖွှ': 'फ्हव',
  'ဗျ': 'ब्य', 'ဗြ': 'ब्य', 'ဗှ': 'ब्ह', 'ဗွ': 'ब्व', 'ဗွှ': 'ब्हव',
  'ဘျ': 'ब्य', 'ဘြ': 'ब्य', 'ဘှ': 'ब्ह', 'ဘွ': 'ब्व', 'ဘွှ': 'ब्हव',
  'မျ': 'म्य', 'မြ': 'म्य', 'မှ': 'म्ह', 'မွ': 'म्व', 'မွှ': 'म्हव',
  'ယျ': 'य्य', 'ယြ': 'य्य', 'ယှ': 'य्ह', 'ယွ': 'य्व', 'ယွှ': 'य्हव',
  'ရျ': 'य्य', 'ရြ': 'य्य', 'ရှ': 'श', 'ရွ': 'य्व', 'ရွှ': 'य्हव',
  'လျ': 'ल्य', 'လြ': 'ल्य', 'လှ': 'ल्ह', 'လွ': 'ल्व', 'လွှ': 'ल्हव',
  'သျ': 'थ्य', 'သြ': 'थ्य', 'သှ': 'थ्ह', 'သွ': 'थ्व', 'သွှ': 'थ्हव',
  'ဟျ': 'ह्य', 'ဟြ': 'ह्य', 'ဟှ': 'ह्ह', 'ဟွ': 'ह्व', 'ဟွှ': 'ह्हव',
};

const DEFAULT_SPECIAL_CASES = {
  'မင်္ဂလာပါ': 'मिं2ग1ला2बा2',
  'မင်္ဂလာပါ။': 'मिं2ग1ला2बा2॥',
};

const DEFAULT_CONVERSATIONS = [
  { srNo: 1, tag: 'Title', burmese: '-', english: 'Greeting 1' },
  { srNo: 2, tag: 'Description', burmese: '-', english: 'Normal greeting to a friend' },
  { srNo: 3, tag: 'Bot', burmese: 'မင်္ဂလာပါ', english: 'Hello!' },
  { srNo: 4, tag: 'User', burmese: 'မင်္ဂလာပါ', english: 'Hello!' },
  { srNo: 5, tag: 'Bot', burmese: 'နေကောင်းလား။', english: 'How are you?' },
  { srNo: 6, tag: 'User', burmese: 'ကောင်းပါတယ်။', english: "I'm fine." },
  { srNo: 7, tag: 'Bot', burmese: 'ဝမ်းသာပါတယ်။', english: "I'm glad." },
  { srNo: 8, tag: 'End', burmese: '---------', english: '---------' },
];

// ============================================
// RATING SYSTEM
// ============================================
const RATINGS = [
  { id: 1, emoji: '✓', label: 'Monthly Review', description: 'You know this well', color: '#22c55e', days: 30 },
  { id: 2, emoji: '💬', label: "Can't use in conversation", description: "Understand but can't speak", color: '#3b82f6', days: 7 },
  { id: 3, emoji: '✍', label: "Can't write in Burmese", description: "Know meaning but can't write", color: '#f59e0b', days: 3 },
  { id: 4, emoji: '🤔', label: "Understand but can't use", description: "Don't know when to use", color: '#a855f7', days: 1 },
  { id: 5, emoji: '❌', label: "Don't know at all", description: 'Need to learn from scratch', color: '#ef4444', days: 0 },
];

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function BurmeseChatbot() {
  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [consonants, setConsonants] = useState(DEFAULT_CONSONANTS);
  const [vowels, setVowels] = useState(DEFAULT_VOWELS);
  const [medials, setMedials] = useState(DEFAULT_MEDIALS);
  const [specialCases, setSpecialCases] = useState(DEFAULT_SPECIAL_CASES);
  const [conversationsData, setConversationsData] = useState(DEFAULT_CONVERSATIONS);
  const [topics, setTopics] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [lookupTable, setLookupTable] = useState({});
  const [sortedPatterns, setSortedPatterns] = useState([]);
  
  // UI state
  const [mode, setMode] = useState('learn');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Progress state
  const [messageRatings, setMessageRatings] = useState({});
  const [wrongAnswers, setWrongAnswers] = useState([]);
  
  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Build lookup table when data changes
  useEffect(() => {
    const lookup = buildLookupTable(consonants, vowels, medials);
    setLookupTable(lookup);
    setSortedPatterns(Object.keys(lookup).sort((a, b) => b.length - a.length));
  }, [consonants, vowels, medials]);
  
  // Parse conversations when data changes
  useEffect(() => {
    if (conversationsData.length > 0 && Object.keys(lookupTable).length > 0) {
      const parsed = parseConversations(conversationsData, specialCases, lookupTable, sortedPatterns);
      setTopics(parsed.topics);
      setAllMessages(parsed.allMessages);
    }
  }, [conversationsData, lookupTable, sortedPatterns, specialCases]);
  
  const loadAllData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Load saved progress
      const savedRatings = await StorageService.loadRatings();
      const savedWrongAnswers = await StorageService.loadWrongAnswers();
      setMessageRatings(savedRatings);
      setWrongAnswers(savedWrongAnswers);
      
      // Try to load CSVs
      const [consonantsData, vowelsData, medialsData, conversationsDataLoaded, specialCasesData] = await Promise.all([
        loadCSV(CONFIG.CSV_PATHS.consonants),
        loadCSV(CONFIG.CSV_PATHS.vowels),
        loadCSV(CONFIG.CSV_PATHS.medials),
        loadCSV(CONFIG.CSV_PATHS.conversations),
        loadCSV(CONFIG.CSV_PATHS.specialCases),
      ]);
      
      // Process consonants
      if (consonantsData) {
        const consonantsObj = {};
        consonantsData.forEach(row => {
          if (row.Burmese) {
            consonantsObj[row.Burmese] = {
              marathi1: row.Marathi1 || row.Marathi || '',
              marathi2: row.Marathi2 || '',
              english: row.English || '',
            };
          }
        });
        if (Object.keys(consonantsObj).length > 0) {
          setConsonants(consonantsObj);
        }
      }
      
      // Process vowels
      if (vowelsData) {
        const vowelsObj = {};
        vowelsData.forEach(row => {
          const burmeseKey = row.Burmese_extra || row.Burmese_extra2 || row.Vowels;
          if (burmeseKey && burmeseKey !== '◌') {
            vowelsObj[burmeseKey] = {
              marathi: row.Marathi_extra || row.Marathi || '',
            };
          }
        });
        if (Object.keys(vowelsObj).length > 0) {
          setVowels(prev => ({ ...prev, ...vowelsObj }));
        }
      }
      
      // Process medials
      if (medialsData) {
        const medialsObj = {};
        medialsData.forEach(row => {
          if (row.Burmese_extra && row.Marathi && row.Marathi !== '-' && row.Marathi !== '#N/A') {
            medialsObj[row.Burmese_extra] = row.Marathi;
          }
        });
        if (Object.keys(medialsObj).length > 0) {
          setMedials(prev => ({ ...prev, ...medialsObj }));
        }
      }
      
      // Process conversations
      if (conversationsDataLoaded) {
        const convArr = conversationsDataLoaded.map((row, idx) => ({
          srNo: parseInt(row['Sr. No.']) || idx + 1,
          tag: row.Tag || '',
          burmese: row.Burmese || '',
          english: row.English || '',
        })).filter(row => row.tag);
        if (convArr.length > 0) {
          setConversationsData(convArr);
        }
      }
      
      // Process special cases
      if (specialCasesData) {
        const specialObj = {};
        specialCasesData.forEach(row => {
          if (row.Burmese && row.Devanagari) {
            specialObj[row.Burmese] = row.Devanagari;
          }
        });
        if (Object.keys(specialObj).length > 0) {
          setSpecialCases(prev => ({ ...prev, ...specialObj }));
        }
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadError('Some data files could not be loaded. Using default data.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Build lookup table
  const buildLookupTable = (cons, vow, med) => {
    const lookup = {};
    
    // 1. Medials (highest priority)
    Object.entries(med).forEach(([burmese, marathi]) => {
      if (burmese && marathi) lookup[burmese] = marathi;
    });
    
    // 2. Vowels
    Object.entries(vow).forEach(([burmese, data]) => {
      if (burmese && !lookup[burmese]) {
        lookup[burmese] = typeof data === 'string' ? data : data.marathi;
      }
    });
    
    // 3. Consonants
    Object.entries(cons).forEach(([burmese, data]) => {
      if (burmese && !lookup[burmese]) {
        lookup[burmese] = typeof data === 'string' ? data : data.marathi1;
      }
    });
    
    return lookup;
  };
  
  // Convert Burmese to Devanagari
  const convertToDevanagari = (text) => {
    if (!text || text === '-' || text === '---------') return '';
    
    const trimmed = text.trim();
    
    // Check special cases first
    if (specialCases[trimmed]) return specialCases[trimmed];
    
    let result = '';
    let remaining = trimmed;
    
    while (remaining.length > 0) {
      let matched = false;
      
      for (const pattern of sortedPatterns) {
        if (remaining.startsWith(pattern)) {
          result += lookupTable[pattern];
          remaining = remaining.slice(pattern.length);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        const char = remaining[0];
        if (char === ' ') result += ' ';
        else if (char === '၊') result += '।';
        else if (char === '။') result += '॥';
        else result += char;
        remaining = remaining.slice(1);
      }
    }
    
    return result;
  };
  
  // Parse conversations into topics
  const parseConversations = (data, specCases, lookup, patterns) => {
    const topics = [];
    const seenBurmese = new Set();
    let currentTopic = null;
    
    for (const row of data) {
      if (row.tag === 'Title') {
        if (currentTopic && currentTopic.messages.length > 0) {
          topics.push(currentTopic);
        }
        currentTopic = {
          id: topics.length + 1,
          title: row.english || 'Untitled',
          description: '',
          messages: [],
        };
      } else if (row.tag === 'Description' && currentTopic) {
        currentTopic.description = row.english || '';
      } else if ((row.tag === 'Bot' || row.tag === 'User') && currentTopic) {
        const burmese = (row.burmese || '').trim();
        if (burmese && burmese !== '-') {
          currentTopic.messages.push({
            id: row.srNo,
            role: row.tag.toLowerCase(),
            burmese: burmese,
            english: row.english || '',
            devanagari: specCases[burmese] || convertTextToDevanagari(burmese, specCases, lookup, patterns),
          });
        }
      } else if (row.tag === 'End' && currentTopic) {
        if (currentTopic.messages.length > 0) {
          topics.push(currentTopic);
        }
        currentTopic = null;
      }
    }
    
    if (currentTopic && currentTopic.messages.length > 0) {
      topics.push(currentTopic);
    }
    
    // Build allMessages with deduplication
    const allMessages = [];
    topics.forEach(topic => {
      topic.messages.forEach((msg, idx) => {
        if (!seenBurmese.has(msg.burmese)) {
          seenBurmese.add(msg.burmese);
          allMessages.push({
            ...msg,
            topicId: topic.id,
            topicTitle: topic.title,
            previousMessage: idx > 0 ? topic.messages[idx - 1] : null,
            nextMessage: idx < topic.messages.length - 1 ? topic.messages[idx + 1] : null,
          });
        }
      });
    });
    
    return { topics, allMessages };
  };
  
  // Helper function for conversion during parsing
  const convertTextToDevanagari = (text, specCases, lookup, patterns) => {
    if (!text || text === '-') return '';
    const trimmed = text.trim();
    if (specCases[trimmed]) return specCases[trimmed];
    
    let result = '';
    let remaining = trimmed;
    
    while (remaining.length > 0) {
      let matched = false;
      for (const pattern of patterns) {
        if (remaining.startsWith(pattern)) {
          result += lookup[pattern];
          remaining = remaining.slice(pattern.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const char = remaining[0];
        if (char === ' ') result += ' ';
        else if (char === '၊') result += '।';
        else if (char === '။') result += '॥';
        else result += char;
        remaining = remaining.slice(1);
      }
    }
    return result;
  };
  
  // Save rating
  const saveRating = async (messageId, rating) => {
    await StorageService.saveRating(messageId, rating);
    setMessageRatings(prev => ({
      ...prev,
      [messageId]: { rating_id: rating.id, rating_label: rating.label },
    }));
  };
  
  // Save wrong answer
  const saveWrongAnswer = async (questionId, wrongAnswerId) => {
    await StorageService.saveWrongAnswer(questionId, wrongAnswerId);
    setWrongAnswers(prev => [...prev, { question_id: questionId, wrong_answer_id: wrongAnswerId }]);
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>⏳</div>
        <div style={styles.loadingText}>Loading Burmese Learning App...</div>
        <div style={styles.loadingSubtext}>Preparing consonants, vowels, and conversations</div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>မြ</div>
          <div style={styles.logoText}>Burmese Learn</div>
        </div>
        
        <nav style={styles.navTabs}>
          {[
            { id: 'learn', icon: '📚', label: 'Learn' },
            { id: 'quiz', icon: '🎯', label: 'Quiz' },
            { id: 'review', icon: '📊', label: 'Review' },
            { id: 'converter', icon: '🔧', label: 'Converter' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              style={{
                ...styles.navTab,
                ...(mode === tab.id ? styles.navTabActive : styles.navTabInactive),
              }}
              onClick={() => {
                setMode(tab.id);
                setSelectedTopic(null);
                setIsComplete(false);
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </header>
      
      {/* Error Banner */}
      {loadError && (
        <div style={styles.errorBanner}>
          ⚠️ {loadError}
        </div>
      )}
      
      {/* Main Content */}
      <main style={styles.main}>
        {mode === 'learn' && (
          <LearnMode
            topics={topics}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            isComplete={isComplete}
            setIsComplete={setIsComplete}
            onWrongAnswer={saveWrongAnswer}
          />
        )}
        
        {mode === 'quiz' && (
          <QuizMode
            topics={topics}
            allMessages={allMessages}
            onRating={saveRating}
            onWrongAnswer={saveWrongAnswer}
          />
        )}
        
        {mode === 'review' && (
          <ReviewMode
            allMessages={allMessages}
            ratings={messageRatings}
            wrongAnswers={wrongAnswers}
            RATINGS={RATINGS}
          />
        )}
        
        {mode === 'converter' && (
          <ConverterMode
            convertToDevanagari={convertToDevanagari}
            specialCases={specialCases}
            lookupTable={lookupTable}
            sortedPatterns={sortedPatterns}
            medials={medials}
          />
        )}
        
        {mode === 'settings' && (
          <SettingsMode
            config={CONFIG}
            onReload={loadAllData}
            onClearData={async () => {
              await StorageService.clearAll();
              setMessageRatings({});
              setWrongAnswers([]);
            }}
            dataStats={{
              consonants: Object.keys(consonants).length,
              vowels: Object.keys(vowels).length,
              medials: Object.keys(medials).length,
              specialCases: Object.keys(specialCases).length,
              topics: topics.length,
              messages: allMessages.length,
              ratings: Object.keys(messageRatings).length,
              wrongAnswers: wrongAnswers.length,
            }}
          />
        )}
      </main>
      
      {/* Footer */}
      <footer style={styles.footer}>
        Built for Burmese language learning • {allMessages.length} phrases loaded
      </footer>
    </div>
  );
}

// ============================================
// LEARN MODE COMPONENT
// ============================================
const LearnMode = ({ topics, selectedTopic, setSelectedTopic, isComplete, setIsComplete, onWrongAnswer }) => {
  if (!selectedTopic) {
    return <TopicSelector topics={topics} onSelect={setSelectedTopic} />;
  }
  
  if (isComplete) {
    return (
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
    );
  }
  
  return (
    <ChatView
      topic={selectedTopic}
      onBack={() => setSelectedTopic(null)}
      onComplete={() => setIsComplete(true)}
      onWrongAnswer={onWrongAnswer}
    />
  );
};

// ============================================
// TOPIC SELECTOR COMPONENT
// ============================================
const TopicSelector = ({ topics, onSelect }) => {
  const [hoveredId, setHoveredId] = useState(null);
  
  if (topics.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>No topics available</div>
        <div style={{ color: '#94a3b8' }}>Add conversations to your CSV file to get started</div>
      </div>
    );
  }
  
  return (
    <div>
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

// ============================================
// CHAT VIEW COMPONENT
// ============================================
const ChatView = ({ topic, onBack, onComplete, onWrongAnswer }) => {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [responseOptions, setResponseOptions] = useState([]);
  const [wrongSelections, setWrongSelections] = useState(new Set());
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);
  
  useEffect(() => {
    setVisibleMessages([]);
    setCurrentIndex(0);
    setWaitingForResponse(false);
    setResponseOptions([]);
    setWrongSelections(new Set());
    
    if (topic.messages.length > 0) {
      showNextMessage(0);
    }
  }, [topic]);
  
  const showNextMessage = (index) => {
    if (index >= topic.messages.length) {
      setTimeout(() => onComplete(), 1000);
      return;
    }
    
    const msg = topic.messages[index];
    
    if (msg.role === 'bot') {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, msg]);
        setCurrentIndex(index + 1);
        
        if (index + 1 < topic.messages.length && topic.messages[index + 1].role === 'user') {
          const correctResponse = topic.messages[index + 1];
          const otherResponses = topic.messages
            .filter((m, i) => m.role === 'user' && i !== index + 1)
            .slice(0, 2);
          
          const options = [correctResponse, ...otherResponses].sort(() => Math.random() - 0.5);
          setResponseOptions(options);
          setWaitingForResponse(true);
          setWrongSelections(new Set());
        } else {
          showNextMessage(index + 1);
        }
      }, 800);
    }
  };
  
  const handleResponseSelect = (selectedMsg) => {
    const correctMsg = topic.messages[currentIndex];
    
    if (selectedMsg.id === correctMsg.id) {
      setVisibleMessages(prev => [...prev, correctMsg]);
      setWaitingForResponse(false);
      setResponseOptions([]);
      setWrongSelections(new Set());
      setTimeout(() => showNextMessage(currentIndex + 1), 500);
    } else {
      setWrongSelections(prev => new Set([...prev, selectedMsg.id]));
      onWrongAnswer(correctMsg.id, selectedMsg.id);
    }
  };
  
  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <div style={styles.chatTitle}>💬 {topic.title}</div>
        <button style={styles.backBtn} onClick={onBack}>← Back</button>
      </div>
      
      <div style={styles.messagesArea}>
        {visibleMessages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} isBot={msg.role === 'bot'} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {waitingForResponse && (
        <div style={styles.responseOptions}>
          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#94a3b8' }}>
            Choose your response:
          </div>
          {responseOptions.map((opt, idx) => {
            const isWrong = wrongSelections.has(opt.id);
            return (
              <button
                key={idx}
                style={{
                  ...styles.optionBtn,
                  ...(isWrong ? styles.optionBtnWrong : {}),
                }}
                onClick={() => !isWrong && handleResponseSelect(opt)}
                disabled={isWrong}
              >
                {opt.burmese}
                {isWrong && <span style={{ marginLeft: '10px' }}>❌</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================
// MESSAGE BUBBLE COMPONENT
// ============================================
const MessageBubble = ({ message, isBot }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div style={{ ...styles.messageBubble, ...(isBot ? styles.botBubble : styles.userBubble) }}>
      <div style={{ ...styles.bubbleContent, ...(isBot ? styles.botBubbleContent : styles.userBubbleContent) }}>
        <div style={styles.burmeseText}>{message.burmese}</div>
        <button style={styles.toggleBtn} onClick={() => setShowDetails(!showDetails)}>
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

// ============================================
// QUIZ MODE COMPONENT
// ============================================
const QuizMode = ({ topics, allMessages, onRating, onWrongAnswer }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [quizMessages, setQuizMessages] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [wrongSelections, setWrongSelections] = useState(new Set());
  const [quizComplete, setQuizComplete] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  
  // Get messages for selected topic only
  const getTopicMessages = (topic) => {
    if (!topic) return [];
    return topic.messages || [];
  };
  
  const getBotMessagesWithReplies = (messages) => {
    return messages.filter((msg, idx, arr) => {
      return msg.role === 'bot' && idx < arr.length - 1 && arr[idx + 1].role === 'user';
    }).map((msg, idx, arr) => ({
      ...msg,
      nextMessage: arr[idx + 1] || topics.find(t => t.id === selectedTopic?.id)?.messages[
        topics.find(t => t.id === selectedTopic?.id)?.messages.indexOf(msg) + 1
      ]
    }));
  };
  
  // Initialize quiz when topic or difficulty changes
  useEffect(() => {
    if (!selectedTopic) return;
    
    const topicMessages = getTopicMessages(selectedTopic);
    let msgs;
    
    if (difficulty === 'hard') {
      // For hard mode, get bot messages that have user replies
      msgs = [];
      for (let i = 0; i < topicMessages.length - 1; i++) {
        if (topicMessages[i].role === 'bot' && topicMessages[i + 1].role === 'user') {
          msgs.push({
            ...topicMessages[i],
            nextMessage: topicMessages[i + 1]
          });
        }
      }
    } else {
      msgs = [...topicMessages];
    }
    
    const shuffled = msgs.sort(() => Math.random() - 0.5);
    setQuizMessages(shuffled);
    setCurrentQuestion(shuffled[0] || null);
    setCurrentIdx(0);
    setShowAnswer(false);
    setShowRating(false);
    setWrongSelections(new Set());
    setQuizComplete(false);
  }, [selectedTopic, difficulty]);
  
  const handleNext = () => {
    setShowAnswer(false);
    setUserInput('');
    setShowRating(false);
    setWrongSelections(new Set());
    
    const nextIdx = currentIdx + 1;
    if (nextIdx < quizMessages.length) {
      setCurrentIdx(nextIdx);
      setCurrentQuestion(quizMessages[nextIdx]);
    } else {
      // Quiz complete for this topic
      setQuizComplete(true);
    }
  };
  
  const handleRating = (rating) => {
    onRating(currentQuestion.id, rating);
    handleNext();
  };
  
  const handleRestartQuiz = () => {
    const shuffled = [...quizMessages].sort(() => Math.random() - 0.5);
    setQuizMessages(shuffled);
    setCurrentIdx(0);
    setCurrentQuestion(shuffled[0]);
    setQuizComplete(false);
    setShowAnswer(false);
    setShowRating(false);
  };
  
  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setQuizComplete(false);
  };
  
  const getEasyOptions = () => {
    if (!currentQuestion) return [];
    const topicMessages = getTopicMessages(selectedTopic);
    const others = topicMessages.filter(m => m.id !== currentQuestion.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return [currentQuestion, ...others].sort(() => Math.random() - 0.5);
  };
  
  const getHardOptions = () => {
    if (!currentQuestion?.nextMessage) return [];
    const correctReply = currentQuestion.nextMessage;
    const topicMessages = getTopicMessages(selectedTopic);
    const otherReplies = topicMessages.filter(m => m.role === 'user' && m.id !== correctReply.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return [correctReply, ...otherReplies].sort(() => Math.random() - 0.5);
  };
  
  // Topic Selection Screen
  if (!selectedTopic) {
    return (
      <div style={styles.quizContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>🎯 Quiz Mode</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '24px' }}>
          Select a topic to quiz yourself on:
        </p>
        
        <div style={styles.topicGrid}>
          {topics.map((topic) => (
            <div
              key={topic.id}
              style={{
                ...styles.topicCard,
                ...(hoveredId === topic.id ? styles.topicCardHover : {}),
              }}
              onClick={() => setSelectedTopic(topic)}
              onMouseEnter={() => setHoveredId(topic.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={styles.topicTitle}>🎯 {topic.title}</div>
              <div style={styles.topicDesc}>{topic.description || 'Test your knowledge'}</div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                {topic.messages.length} questions
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Quiz Complete Screen
  if (quizComplete) {
    return (
      <div style={styles.quizContainer}>
        <div style={styles.completionMessage}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Quiz Complete!</div>
          <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
            You finished "{selectedTopic.title}"
          </div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>
            {quizMessages.length} questions answered
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={styles.primaryBtn} onClick={handleRestartQuiz}>
              🔄 Try Again
            </button>
            <button 
              style={{ ...styles.primaryBtn, background: 'rgba(255,255,255,0.1)' }} 
              onClick={handleBackToTopics}
            >
              ← Choose Topic
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return (
      <div style={styles.quizContainer}>
        <div style={styles.emptyState}>
          <div>No questions available for this topic</div>
          <button style={{ ...styles.primaryBtn, marginTop: '16px' }} onClick={handleBackToTopics}>
            ← Choose Another Topic
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.quizContainer}>
      {/* Header with topic name and back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button style={styles.backBtn} onClick={handleBackToTopics}>← Topics</button>
        <h2 style={{ margin: 0, fontSize: '18px' }}>🎯 {selectedTopic.title}</h2>
        <div style={{ width: '80px' }}></div>
      </div>
      
      {/* Difficulty Selector */}
      <div style={styles.difficultySelector}>
        {[
          { id: 'easy', label: '📖 Easy', color: '#22c55e' },
          { id: 'medium', label: '✍️ Medium', color: '#f59e0b' },
          { id: 'hard', label: '🔥 Hard', color: '#ef4444' },
        ].map(d => (
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
        
        <div style={styles.quizBurmese}>{currentQuestion.burmese}</div>
        
        {difficulty === 'hard' && !showAnswer && (
          <div style={{ color: '#94a3b8', marginBottom: '16px' }}>📝 {currentQuestion.english}</div>
        )}
        
        {difficulty === 'medium' && !showAnswer && (
          <div style={styles.quizHint}>
            <div style={{ color: '#fbbf24', marginBottom: '8px' }}>🔊 {currentQuestion.devanagari}</div>
            <div style={{ color: '#94a3b8' }}>📝 {currentQuestion.english}</div>
          </div>
        )}
        
        {difficulty === 'easy' && !showAnswer && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>What does this mean?</div>
            {getEasyOptions().map((opt, idx) => {
              const isWrong = wrongSelections.has(opt.id);
              return (
                <button
                  key={idx}
                  style={{ ...styles.optionBtn, ...(isWrong ? styles.optionBtnWrong : {}) }}
                  onClick={() => {
                    if (!isWrong) {
                      if (opt.id === currentQuestion.id) {
                        setShowAnswer(true);
                        setShowRating(true);
                      } else {
                        setWrongSelections(prev => new Set([...prev, opt.id]));
                        onWrongAnswer(currentQuestion.id, opt.id);
                      }
                    }
                  }}
                  disabled={isWrong}
                >
                  {opt.english} {isWrong && '❌'}
                </button>
              );
            })}
          </div>
        )}
        
        {difficulty === 'hard' && !showAnswer && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>How would you reply?</div>
            {getHardOptions().map((opt, idx) => {
              const isWrong = wrongSelections.has(opt.id);
              const correctReply = currentQuestion.nextMessage;
              return (
                <button
                  key={idx}
                  style={{ ...styles.optionBtn, ...(isWrong ? styles.optionBtnWrong : {}) }}
                  onClick={() => {
                    if (!isWrong) {
                      if (opt.id === correctReply?.id) {
                        setShowAnswer(true);
                        setShowRating(true);
                      } else {
                        setWrongSelections(prev => new Set([...prev, opt.id]));
                        onWrongAnswer(currentQuestion.id, opt.id);
                      }
                    }
                  }}
                  disabled={isWrong}
                >
                  {opt.burmese} {isWrong && '❌'}
                </button>
              );
            })}
          </div>
        )}
        
        {difficulty === 'medium' && !showAnswer && (
          <div>
            <input
              type="text"
              style={styles.quizInput}
              placeholder="Type in Burmese..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setShowAnswer(true), setShowRating(true))}
            />
            <button style={{ ...styles.primaryBtn, marginTop: '16px' }} onClick={() => { setShowAnswer(true); setShowRating(true); }}>
              Check Answer
            </button>
          </div>
        )}
        
        {showAnswer && (
          <div style={styles.quizHint}>
            <div style={{ color: '#22c55e', marginBottom: '8px', fontWeight: '600' }}>
              ✓ {difficulty === 'hard' ? 'Correct Reply:' : 'Answer:'}
            </div>
            {difficulty === 'hard' && currentQuestion.nextMessage ? (
              <>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{currentQuestion.nextMessage.burmese}</div>
                <div style={{ color: '#fbbf24', marginBottom: '8px' }}>🔊 {currentQuestion.nextMessage.devanagari}</div>
                <div style={{ color: '#e2e8f0' }}>📝 {currentQuestion.nextMessage.english}</div>
              </>
            ) : (
              <>
                <div style={{ color: '#fbbf24', marginBottom: '8px', fontSize: '18px' }}>🔊 {currentQuestion.devanagari}</div>
                <div style={{ color: '#e2e8f0', fontSize: '16px' }}>📝 {currentQuestion.english}</div>
              </>
            )}
          </div>
        )}
      </div>
      
      {showRating && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '16px', color: '#94a3b8' }}>How well did you know this?</div>
          <div style={styles.ratingContainer}>
            {RATINGS.map(rating => (
              <button
                key={rating.id}
                style={styles.ratingBtn}
                onClick={() => handleRating(rating)}
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

// ============================================
// REVIEW MODE COMPONENT
// ============================================
const ReviewMode = ({ allMessages, ratings, wrongAnswers, RATINGS }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  
  const getMessagesByRating = (ratingId) => allMessages.filter(msg => ratings[msg.id]?.rating_id === ratingId);
  const getUnratedMessages = () => allMessages.filter(msg => !ratings[msg.id]);
  
  const wrongAnswerCounts = wrongAnswers.reduce((acc, wa) => {
    acc[wa.question_id] = (acc[wa.question_id] || 0) + 1;
    return acc;
  }, {});
  
  const displayMessages = selectedRating === null 
    ? allMessages 
    : selectedRating === 'unrated' 
      ? getUnratedMessages() 
      : getMessagesByRating(selectedRating);
  
  return (
    <div style={styles.reviewContainer}>
      <h2 style={{ marginBottom: '24px' }}>📊 Review Progress</h2>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{allMessages.length}</div>
          <div style={styles.statLabel}>Total Phrases</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{Object.keys(ratings).length}</div>
          <div style={styles.statLabel}>Rated</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{wrongAnswers.length}</div>
          <div style={styles.statLabel}>Mistakes</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Filter by Rating:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            style={{ ...styles.filterBtn, background: selectedRating === null ? 'rgba(255,255,255,0.2)' : 'transparent' }}
            onClick={() => setSelectedRating(null)}
          >
            All ({allMessages.length})
          </button>
          <button
            style={{ ...styles.filterBtn, background: selectedRating === 'unrated' ? 'rgba(255,255,255,0.2)' : 'transparent' }}
            onClick={() => setSelectedRating('unrated')}
          >
            Unrated ({getUnratedMessages().length})
          </button>
          {RATINGS.map(r => (
            <button
              key={r.id}
              style={{ ...styles.filterBtn, borderColor: r.color, background: selectedRating === r.id ? `${r.color}30` : 'transparent' }}
              onClick={() => setSelectedRating(r.id)}
            >
              {r.emoji} ({getMessagesByRating(r.id).length})
            </button>
          ))}
        </div>
      </div>
      
      <div style={styles.messageList}>
        {displayMessages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No messages in this category</div>
        ) : (
          displayMessages.map((msg, idx) => (
            <div key={idx} style={styles.reviewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{msg.burmese}</div>
                  <div style={{ color: '#fbbf24', fontSize: '14px', marginBottom: '4px' }}>{msg.devanagari}</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>{msg.english}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {ratings[msg.id] && (
                    <span style={{ fontSize: '24px' }}>
                      {RATINGS.find(r => r.id === ratings[msg.id].rating_id)?.emoji}
                    </span>
                  )}
                  {wrongAnswerCounts[msg.id] && (
                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                      ❌ {wrongAnswerCounts[msg.id]} mistakes
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================
// CONVERTER MODE COMPONENT
// ============================================
const ConverterMode = ({ convertToDevanagari, specialCases, lookupTable, sortedPatterns, medials }) => {
  const [inputText, setInputText] = useState('မင်္ဂလာပါ');
  const [result, setResult] = useState('');
  
  useEffect(() => {
    setResult(convertToDevanagari(inputText));
  }, [inputText, convertToDevanagari]);
  
  const sampleTexts = ['မင်္ဂလာပါ', 'နေကောင်းလား။', 'ကောင်းပါတယ်။', 'ကျေးဇူးတင်ပါတယ်'];
  
  return (
    <div style={styles.converterContainer}>
      <h2 style={{ marginBottom: '24px' }}>🔧 Converter Tool</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Enter Burmese text:</label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={styles.quizInput}
          placeholder="Type Burmese text..."
        />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '14px' }}>Quick samples:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sampleTexts.map((text, idx) => (
            <button key={idx} onClick={() => setInputText(text)} style={styles.sampleBtn}>{text}</button>
          ))}
        </div>
      </div>
      
      <div style={styles.converterResult}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Input:</div>
          <div style={{ fontSize: '24px' }}>{inputText}</div>
        </div>
        <div>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Output (Devanagari):</div>
          <div style={{ fontSize: '24px', color: '#fbbf24' }}>{result}</div>
          {specialCases[inputText.trim()] && (
            <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(34,197,94,0.2)', borderRadius: '8px', color: '#22c55e', fontSize: '14px' }}>
              ✨ Special case match
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>📊 Data Stats:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={styles.miniStatCard}>
            <div style={{ fontSize: '24px', color: '#f59e0b' }}>{Object.keys(lookupTable).length}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Patterns</div>
          </div>
          <div style={styles.miniStatCard}>
            <div style={{ fontSize: '24px', color: '#a855f7' }}>{Object.keys(medials).length}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Medial Combos</div>
          </div>
          <div style={styles.miniStatCard}>
            <div style={{ fontSize: '24px', color: '#22c55e' }}>{Object.keys(specialCases).length}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Special Cases</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SETTINGS MODE COMPONENT
// ============================================
const SettingsMode = ({ config, onReload, onClearData, dataStats }) => {
  return (
    <div style={styles.settingsContainer}>
      <h2 style={{ marginBottom: '24px' }}>⚙️ Settings</h2>
      
      <div style={styles.settingsSection}>
        <h3>📊 Data Statistics</h3>
        <div style={styles.statsGridSmall}>
          {Object.entries(dataStats).map(([key, value]) => (
            <div key={key} style={styles.miniStatCard}>
              <div style={{ fontSize: '20px', color: '#f59e0b' }}>{value}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={styles.settingsSection}>
        <h3>🔄 Data Management</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={styles.primaryBtn} onClick={onReload}>
            🔄 Reload CSV Data
          </button>
          <button style={styles.dangerBtn} onClick={() => {
            if (window.confirm('Clear all progress data? This cannot be undone.')) {
              onClearData();
            }
          }}>
            🗑️ Clear Progress
          </button>
        </div>
      </div>
      
      <div style={styles.settingsSection}>
        <h3>📁 CSV File Paths</h3>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#94a3b8' }}>
{`Consonants: ${config.CSV_PATHS.consonants}
Vowels: ${config.CSV_PATHS.vowels}
Medials: ${config.CSV_PATHS.medials}
Conversations: ${config.CSV_PATHS.conversations}
Special Cases: ${config.CSV_PATHS.specialCases}`}
          </pre>
        </div>
      </div>
      
      <div style={styles.settingsSection}>
        <h3>☁️ Supabase Status</h3>
        <div style={{ padding: '16px', background: config.USE_SUPABASE ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '12px' }}>
          {config.USE_SUPABASE ? (
            <span style={{ color: '#22c55e' }}>✓ Connected to Supabase</span>
          ) : (
            <span style={{ color: '#ef4444' }}>✗ Using Local Storage (configure Supabase in code)</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPLETION SCREEN COMPONENT
// ============================================
const CompletionScreen = ({ topic, onRestart, onBack }) => (
  <div style={styles.completionMessage}>
    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
    <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Conversation Complete!</div>
    <div style={{ color: '#94a3b8' }}>You finished "{topic.title}"</div>
    <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
      <button style={styles.primaryBtn} onClick={onRestart}>🔄 Practice Again</button>
      <button style={{ ...styles.primaryBtn, background: 'rgba(255,255,255,0.1)' }} onClick={onBack}>← Choose Topic</button>
    </div>
  </div>
);

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
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: '#e2e8f0',
  },
  loadingSpinner: { fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' },
  loadingText: { fontSize: '20px', fontWeight: '600' },
  loadingSubtext: { color: '#94a3b8', marginTop: '8px' },
  header: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '12px' },
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
  navTabs: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  navTab: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navTabActive: { background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white' },
  navTabInactive: { background: 'rgba(255,255,255,0.1)', color: '#94a3b8' },
  errorBanner: {
    background: 'rgba(239,68,68,0.2)',
    color: '#fca5a5',
    padding: '12px 24px',
    textAlign: 'center',
    fontSize: '14px',
  },
  main: { maxWidth: '900px', margin: '0 auto', padding: '24px' },
  footer: { textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8' },
  topicGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
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
    border: '2px solid rgba(245,158,11,0.5)',
    transform: 'translateY(-2px)',
  },
  topicTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' },
  topicDesc: { fontSize: '13px', color: '#94a3b8' },
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
  chatTitle: { fontSize: '16px', fontWeight: '600' },
  backBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  messagesArea: { padding: '20px', minHeight: '400px', maxHeight: '500px', overflowY: 'auto' },
  messageBubble: { maxWidth: '80%', marginBottom: '16px' },
  botBubble: { marginRight: 'auto' },
  userBubble: { marginLeft: 'auto' },
  bubbleContent: { padding: '14px 18px', borderRadius: '18px' },
  botBubbleContent: { background: 'rgba(59,130,246,0.2)', borderBottomLeftRadius: '4px' },
  userBubbleContent: { background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderBottomRightRadius: '4px' },
  burmeseText: { fontSize: '20px', lineHeight: '1.6' },
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
  hiddenContent: { marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '14px' },
  devanagariText: { color: '#fbbf24', marginBottom: '4px' },
  englishText: { color: '#94a3b8', fontStyle: 'italic' },
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
  optionBtnWrong: {
    background: 'rgba(239,68,68,0.3)',
    borderColor: '#ef4444',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  quizContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  difficultySelector: { display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center', flexWrap: 'wrap' },
  difficultyBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    background: 'transparent',
  },
  quizCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '30px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  quizBurmese: { fontSize: '32px', marginBottom: '16px', lineHeight: '1.5' },
  quizHint: { background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginTop: '16px' },
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
    boxSizing: 'border-box',
  },
  ratingContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
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
    textAlign: 'left',
  },
  ratingEmoji: { fontSize: '24px' },
  ratingLabel: { fontWeight: '600' },
  ratingDesc: { fontSize: '12px', color: '#94a3b8' },
  completionMessage: { textAlign: 'center', padding: '40px' },
  primaryBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dangerBtn: {
    padding: '14px 32px',
    background: 'rgba(239,68,68,0.2)',
    border: '2px solid #ef4444',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  reviewContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  statsGridSmall: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' },
  statCard: { background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  statNumber: { fontSize: '32px', fontWeight: '700', color: '#f59e0b' },
  statLabel: { color: '#94a3b8', fontSize: '14px', marginTop: '4px' },
  miniStatCard: { background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '13px',
  },
  messageList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  reviewCard: { background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' },
  converterContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  converterResult: { background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
  sampleBtn: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '16px',
  },
  settingsContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  settingsSection: { marginBottom: '32px' },
};
