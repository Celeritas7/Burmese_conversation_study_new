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
// DATA: Medial Consonant Combinations (Consonant + Medials)
// These have HIGHER priority than individual consonants
// Medials: ျ ြ ှ ွ ွှ
// ============================================
const MEDIAL_COMBINATIONS = {
  // က combinations
  'ကျ': 'च', 'ကြ': 'च', 'ကှ': 'क्ह', 'ကွ': 'क्व', 'ကွှ': 'क्हव',
  // ခ combinations
  'ချ': 'छ', 'ခြ': 'छ', 'ခှ': 'ख्ह', 'ခွ': 'ख्व', 'ခွှ': 'ख्हव',
  // ဂ combinations
  'ဂျ': 'ज', 'ဂြ': 'ज', 'ဂှ': 'ग्ह', 'ဂွ': 'ग्व', 'ဂွှ': 'ग्हव',
  // ဃ combinations
  'ဃျ': 'घ्य', 'ဃြ': 'घ्य', 'ဃှ': 'घ्ह', 'ဃွ': 'घ्व', 'ဃွှ': 'घ्हव',
  // င combinations
  'ငျ': 'ङ्य', 'ငြ': 'ज्ञ', 'ငှ': 'ङ्ह', 'ငွ': 'ङ्व', 'ငွှ': 'ङ्हव',
  // ဇ combinations
  'ဇျ': 'ज्य', 'ဇြ': 'ज्य', 'ဇှ': 'ज्ह', 'ဇွ': 'ज्व', 'ဇွှ': 'ज्हव',
  // ဈ combinations
  'ဈျ': 'झ्य', 'ဈြ': 'झ्य', 'ဈှ': 'झ्ह', 'ဈွ': 'झ्व', 'ဈွှ': 'झ्हव',
  // ဋ combinations
  'ဋျ': 'ट्य', 'ဋြ': 'ट्य', 'ဋှ': 'ट्ह', 'ဋွ': 'ट्व', 'ဋွှ': 'ट्हव',
  // ဌ combinations
  'ဌျ': 'ठ्य', 'ဌြ': 'ठ्य', 'ဌှ': 'ठ्ह', 'ဌွ': 'ठ्व', 'ဌွှ': 'ठ्हव',
  // ဍ combinations
  'ဍျ': 'ड्य', 'ဍြ': 'ड्य', 'ဍှ': 'ड्ह', 'ဍွ': 'ड्व', 'ဍွှ': 'ड्हव',
  // ဎ combinations
  'ဎျ': 'ढ्य', 'ဎြ': 'ढ्य', 'ဎှ': 'ढ्ह', 'ဎွ': 'ढ्व', 'ဎွှ': 'ढ्हव',
  // ဏ combinations
  'ဏျ': 'न्य', 'ဏြ': 'न्य', 'ဏှ': 'न्ह', 'ဏွ': 'न्व', 'ဏွှ': 'न्हव',
  // တ combinations
  'တျ': 'त्य', 'တြ': 'त्य', 'တှ': 'त्ह', 'တွ': 'त्व', 'တွှ': 'त्हव',
  // ထ combinations
  'ထျ': 'थ्य', 'ထြ': 'थ्य', 'ထှ': 'थ्ह', 'ထွ': 'थ्व', 'ထွှ': 'थ्हव',
  // သ combinations
  'သျ': 'थ्य', 'သြ': 'थ्य', 'သှ': 'थ्ह', 'သွ': 'थ्व', 'သွှ': 'थ्हव',
  // ဒ combinations
  'ဒျ': 'द्य', 'ဒြ': 'द्य', 'ဒှ': 'द्ह', 'ဒွ': 'द्व', 'ဒွှ': 'द्हव',
  // ဓ combinations
  'ဓျ': 'ध्य', 'ဓြ': 'ध्य', 'ဓှ': 'ध्ह', 'ဓွ': 'ध्व', 'ဓွှ': 'ध्हव',
  // န combinations
  'နျ': 'न्य', 'နြ': 'न्य', 'နှ': 'न्ह', 'နွ': 'न्व', 'နွှ': 'न्हव',
  // ပ combinations
  'ပျ': 'प्य', 'ပြ': 'प्य', 'ပှ': 'प्ह', 'ပွ': 'प्व', 'ပွှ': 'प्हव',
  // ဖ combinations
  'ဖျ': 'फ्य', 'ဖြ': 'फ्य', 'ဖှ': 'फ्ह', 'ဖွ': 'फ्व', 'ဖွှ': 'फ्हव',
  // ဗ combinations
  'ဗျ': 'ब्य', 'ဗြ': 'ब्य', 'ဗှ': 'ब्ह', 'ဗွ': 'ब्व', 'ဗွှ': 'ब्हव',
  // ဘ combinations
  'ဘျ': 'ब्य', 'ဘြ': 'ब्य', 'ဘှ': 'ब्ह', 'ဘွ': 'ब्व', 'ဘွှ': 'ब्हव',
  // မ combinations
  'မျ': 'म्य', 'မြ': 'म्य', 'မှ': 'म्ह', 'မွ': 'म्व', 'မွှ': 'म्हव',
  // ယ combinations
  'ယျ': 'य्य', 'ယြ': 'य्य', 'ယှ': 'य्ह', 'ယွ': 'य्व', 'ယွှ': 'य्हव',
  // ရ combinations
  'ရျ': 'य्य', 'ရြ': 'य्य', 'ရှ': 'श', 'ရွ': 'य्व', 'ရွှ': 'य्हव',
  // လ combinations
  'လျ': 'ल्य', 'လြ': 'ल्य', 'လှ': 'ल्ह', 'လွ': 'ल्व', 'လွှ': 'ल्हव',
  // ဠ combinations
  'ဠျ': 'ल्य', 'ဠြ': 'ल्य', 'ဠှ': 'ल्ह', 'ဠွ': 'ल्व', 'ဠွှ': 'ल्हव',
  // ဝ combinations
  'ဝျ': 'व्य', 'ဝြ': 'व्य', 'ဝှ': 'व्ह', 'ဝွ': 'व्व', 'ဝွှ': 'व्हव',
  // စ combinations
  'စျ': 'स्य', 'စြ': 'स्य', 'စှ': 'स्ह', 'စွ': 'स्व', 'စွှ': 'स्हव',
  // ဿ combinations
  'ဿျ': 'स्स्य', 'ဿြ': 'स्स्य', 'ဿှ': 'स्स्ह', 'ဿွ': 'स्स्व', 'ဿွှ': 'स्स्हव',
  // ဆ combinations
  'ဆျ': 'स्य', 'ဆြ': 'स्य', 'ဆှ': 'स्ह', 'ဆွ': 'स्व', 'ဆွှ': 'स्हव',
  // ဟ combinations
  'ဟျ': 'ह्य', 'ဟြ': 'ह्य', 'ဟှ': 'ह्ह', 'ဟွ': 'ह्व', 'ဟွှ': 'ह्हव',
  // ည combinations
  'ညျ': 'ज्ञ्य', 'ညြ': 'ज्ञ्य', 'ညှ': 'ज्ञ्ह', 'ညွ': 'ज्ञ्व', 'ညွှ': 'ज्ञ्हव',
};

// ============================================
// DATA: Vowels Mapping (Burmese → Marathi)
// ============================================
const VOWELS = {
  'ာ': { marathi: 'ा2', marathiExtra: 'ा2' },
  'ါ': { marathi: 'ा2', marathiExtra: 'ा2' }, // Alternative form of ာ (U+102B vs U+102C)
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
// SPECIAL CASES: Words that don't follow standard conversion rules
// Add exceptions here when the automatic conversion doesn't match pronunciation
// ============================================
const SPECIAL_CASES = {
  // Format: 'Burmese word': 'Correct Devanagari pronunciation'
  'မင်္ဂလာပါ': 'मिं2ग1ला2बा2',  // Hello (Mingalaba)
  'မင်္ဂလာပါ။': 'मिं2ग1ला2बा2॥',  // Hello with punctuation
  
  // Add more special cases here as you discover them:
  // 'ကျေးဇူးတင်ပါတယ်': 'correct pronunciation',
};

// ============================================
// CONVERTER: Burmese to Devanagari
// ============================================
const buildLookupTable = () => {
  const lookup = {};
  
  // 1. Add medial combinations FIRST (highest priority - longest patterns)
  Object.entries(MEDIAL_COMBINATIONS).forEach(([burmese, marathi]) => {
    if (burmese && marathi) {
      lookup[burmese] = marathi;
    }
  });
  
  // 2. Add vowels (often longer patterns)
  Object.entries(VOWELS).forEach(([burmese, data]) => {
    if (burmese && !lookup[burmese]) {
      lookup[burmese] = data.marathi;
    }
  });
  
  // 3. Add consonants (base characters - lowest priority)
  Object.entries(CONSONANTS).forEach(([burmese, data]) => {
    if (burmese && !lookup[burmese]) {
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

// Debug version that shows step-by-step conversion
const convertBurmeseToDevanagariDebug = (burmeseText) => {
  if (!burmeseText || burmeseText === '-' || burmeseText === '---------') {
    return { result: '', steps: [], isSpecialCase: false };
  }
  
  const trimmedText = burmeseText.trim();
  
  // Check for special cases first (whole word/phrase match)
  if (SPECIAL_CASES[trimmedText]) {
    return {
      result: SPECIAL_CASES[trimmedText],
      steps: [{
        matched: trimmedText,
        converted: SPECIAL_CASES[trimmedText],
        remaining: '',
        isSpecialCase: true,
      }],
      isSpecialCase: true,
    };
  }
  
  // Also check if any part of the text is a special case
  let processedText = trimmedText;
  let result = '';
  const steps = [];
  let usedSpecialCase = false;
  
  // Try to match special cases within the text
  for (const [burmese, devanagari] of Object.entries(SPECIAL_CASES)) {
    if (processedText.includes(burmese)) {
      // Found a special case within the text
      const parts = processedText.split(burmese);
      // For now, just note it - we'll process character by character
      // but this could be enhanced for partial special case matching
    }
  }
  
  // Standard character-by-character conversion
  let remaining = trimmedText;
  
  while (remaining.length > 0) {
    let matched = false;
    
    // Try to match longest pattern first
    for (const pattern of SORTED_PATTERNS) {
      if (remaining.startsWith(pattern)) {
        const conversion = LOOKUP_TABLE[pattern];
        steps.push({
          matched: pattern,
          converted: conversion,
          remaining: remaining.slice(pattern.length),
        });
        result += conversion;
        remaining = remaining.slice(pattern.length);
        matched = true;
        break;
      }
    }
    
    // If no pattern matched, keep the character as-is and move on
    if (!matched) {
      const char = remaining[0];
      let converted = char;
      
      if (char === ' ') {
        converted = ' ';
      } else if (char === '၊') {
        converted = '।';
      } else if (char === '။') {
        converted = '॥';
      }
      
      steps.push({
        matched: char,
        converted: converted,
        remaining: remaining.slice(1),
        unmatched: true,
      });
      
      result += converted;
      remaining = remaining.slice(1);
    }
  }
  
  return { result, steps, isSpecialCase: false };
};

const convertBurmeseToDevanagari = (burmeseText) => {
  const trimmedText = (burmeseText || '').trim();
  
  // Check special cases first
  if (SPECIAL_CASES[trimmedText]) {
    return SPECIAL_CASES[trimmedText];
  }
  
  return convertBurmeseToDevanagariDebug(burmeseText).result;
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

// Get all messages with context (previous message for reply matching)
// Deduplicated by Burmese text to avoid repeating same sentence from different topics
const getAllMessagesWithContext = (topics) => {
  const allMessages = [];
  const seenBurmese = new Set();
  
  topics.forEach(topic => {
    topic.messages.forEach((msg, idx) => {
      // Skip if we've already seen this exact Burmese text
      if (seenBurmese.has(msg.burmese)) {
        return;
      }
      seenBurmese.add(msg.burmese);
      
      allMessages.push({
        ...msg,
        topicId: topic.id,
        topicTitle: topic.title,
        previousMessage: idx > 0 ? topic.messages[idx - 1] : null,
        nextMessage: idx < topic.messages.length - 1 ? topic.messages[idx + 1] : null,
      });
    });
  });
  return allMessages;
};

const ALL_MESSAGES = getAllMessagesWithContext(TOPICS);

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
// MAIN APP
// ============================================
export default function BurmeseChatbot() {
  const [mode, setMode] = useState('learn'); // learn, quiz, review, converter
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Rating storage (in real app, this would be Supabase)
  const [messageRatings, setMessageRatings] = useState({});
  const [wrongAnswers, setWrongAnswers] = useState([]);
  
  const saveRating = (messageId, rating) => {
    setMessageRatings(prev => ({
      ...prev,
      [messageId]: rating,
    }));
  };
  
  const saveWrongAnswer = (questionId, wrongAnswerId) => {
    setWrongAnswers(prev => [...prev, { questionId, wrongAnswerId, timestamp: Date.now() }]);
  };
  
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
                onWrongAnswer={saveWrongAnswer}
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
          <QuizView 
            topics={TOPICS} 
            allMessages={ALL_MESSAGES}
            onRating={saveRating}
            onWrongAnswer={saveWrongAnswer}
          />
        )}
        
        {mode === 'review' && (
          <ReviewView 
            allMessages={ALL_MESSAGES}
            ratings={messageRatings}
            wrongAnswers={wrongAnswers}
          />
        )}
        
        {mode === 'converter' && (
          <ConverterDebugView />
        )}
      </main>
      
      {/* Footer */}
      <footer style={styles.footer}>
        Built for Burmese language learning • Devanagari conversion included
      </footer>
    </div>
  );
}

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

// Chat View Component with wrong answer tracking
const ChatView = ({ topic, onBack, onComplete, onWrongAnswer }) => {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [responseOptions, setResponseOptions] = useState([]);
  const [wrongSelections, setWrongSelections] = useState(new Set());
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages]);
  
  useEffect(() => {
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
          
          const options = [correctResponse, ...otherResponses]
            .sort(() => Math.random() - 0.5);
          
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
      // Correct answer
      setVisibleMessages(prev => [...prev, correctMsg]);
      setWaitingForResponse(false);
      setResponseOptions([]);
      setWrongSelections(new Set());
      
      setTimeout(() => {
        showNextMessage(currentIndex + 1);
      }, 500);
    } else {
      // Wrong answer - mark it red and save
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

// Quiz View Component with Hard mode fix
const QuizView = ({ topics, allMessages, onRating, onWrongAnswer }) => {
  const [difficulty, setDifficulty] = useState('easy');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [quizMessages, setQuizMessages] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [wrongSelections, setWrongSelections] = useState(new Set());
  
  // For hard mode: get Bot messages that have a User reply
  const getBotMessagesWithReplies = () => {
    return allMessages.filter(msg => msg.role === 'bot' && msg.nextMessage?.role === 'user');
  };
  
  useEffect(() => {
    let msgs;
    if (difficulty === 'hard') {
      msgs = getBotMessagesWithReplies();
    } else {
      msgs = [...allMessages];
    }
    const shuffled = msgs.sort(() => Math.random() - 0.5);
    setQuizMessages(shuffled);
    if (shuffled.length > 0) {
      setCurrentQuestion(shuffled[0]);
    }
    setCurrentIdx(0);
    setShowAnswer(false);
    setShowRating(false);
    setWrongSelections(new Set());
  }, [difficulty]);
  
  const difficulties = [
    { id: 'easy', label: '📖 Easy', desc: 'Pick meaning', color: '#22c55e' },
    { id: 'medium', label: '✍️ Medium', desc: 'Type with hints', color: '#f59e0b' },
    { id: 'hard', label: '🔥 Hard', desc: 'Reply in Burmese', color: '#ef4444' },
  ];
  
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
    onRating(currentQuestion.id, rating);
    handleNext();
  };
  
  const getEasyOptions = () => {
    if (!currentQuestion) return [];
    const others = allMessages
      .filter(m => m.id !== currentQuestion.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [currentQuestion, ...others].sort(() => Math.random() - 0.5);
  };
  
  const getHardOptions = () => {
    if (!currentQuestion || !currentQuestion.nextMessage) return [];
    const correctReply = currentQuestion.nextMessage;
    const otherReplies = allMessages
      .filter(m => m.role === 'user' && m.id !== correctReply.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correctReply, ...otherReplies].sort(() => Math.random() - 0.5);
  };
  
  const handleEasySelect = (opt) => {
    if (opt.id === currentQuestion.id) {
      setShowAnswer(true);
      setShowRating(true);
    } else {
      setWrongSelections(prev => new Set([...prev, opt.id]));
      onWrongAnswer(currentQuestion.id, opt.id);
    }
  };
  
  const handleHardSelect = (opt) => {
    const correctReply = currentQuestion.nextMessage;
    if (opt.id === correctReply.id) {
      setShowAnswer(true);
      setShowRating(true);
    } else {
      setWrongSelections(prev => new Set([...prev, opt.id]));
      onWrongAnswer(currentQuestion.id, opt.id);
    }
  };
  
  if (!currentQuestion) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading quiz...</div>;
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
        
        {/* Question */}
        <div style={styles.quizBurmese}>
          {currentQuestion.burmese}
        </div>
        
        {difficulty === 'hard' && !showAnswer && (
          <div style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
            📝 {currentQuestion.english}
          </div>
        )}
        
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
        
        {/* Easy mode: Multiple choice for meaning */}
        {difficulty === 'easy' && !showAnswer && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>
              What does this mean?
            </div>
            {getEasyOptions().map((opt, idx) => {
              const isWrong = wrongSelections.has(opt.id);
              return (
                <button
                  key={idx}
                  style={{
                    ...styles.optionBtn,
                    ...(isWrong ? styles.optionBtnWrong : {}),
                  }}
                  onClick={() => !isWrong && handleEasySelect(opt)}
                  disabled={isWrong}
                >
                  {opt.english}
                  {isWrong && <span style={{ marginLeft: '10px' }}>❌</span>}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Hard mode: Reply in Burmese */}
        {difficulty === 'hard' && !showAnswer && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '12px', color: '#94a3b8' }}>
              How would you reply? (Choose the Burmese response)
            </div>
            {getHardOptions().map((opt, idx) => {
              const isWrong = wrongSelections.has(opt.id);
              return (
                <button
                  key={idx}
                  style={{
                    ...styles.optionBtn,
                    ...(isWrong ? styles.optionBtnWrong : {}),
                  }}
                  onClick={() => !isWrong && handleHardSelect(opt)}
                  disabled={isWrong}
                >
                  {opt.burmese}
                  {isWrong && <span style={{ marginLeft: '10px' }}>❌</span>}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Medium mode: Text input */}
        {difficulty === 'medium' && !showAnswer && (
          <div>
            <input
              type="text"
              style={styles.quizInput}
              placeholder="Type in Burmese..."
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
              ✓ {difficulty === 'hard' ? 'Correct Reply:' : 'Answer:'}
            </div>
            {difficulty === 'hard' && currentQuestion.nextMessage ? (
              <>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {currentQuestion.nextMessage.burmese}
                </div>
                <div style={{ color: '#fbbf24', marginBottom: '8px' }}>
                  🔊 {currentQuestion.nextMessage.devanagari}
                </div>
                <div style={{ color: '#e2e8f0' }}>
                  📝 {currentQuestion.nextMessage.english}
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#fbbf24', marginBottom: '8px', fontSize: '18px' }}>
                  🔊 {currentQuestion.devanagari}
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '16px' }}>
                  📝 {currentQuestion.english}
                </div>
              </>
            )}
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
                style={styles.ratingBtn}
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

// Review View Component - Shows sentences grouped by rating
const ReviewView = ({ allMessages, ratings, wrongAnswers }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  
  // Group messages by rating
  const getMessagesByRating = (ratingId) => {
    return allMessages.filter(msg => ratings[msg.id]?.id === ratingId);
  };
  
  const getUnratedMessages = () => {
    return allMessages.filter(msg => !ratings[msg.id]);
  };
  
  // Count wrong answers per message
  const wrongAnswerCounts = wrongAnswers.reduce((acc, wa) => {
    acc[wa.questionId] = (acc[wa.questionId] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div style={styles.reviewContainer}>
      <h2 style={{ marginBottom: '24px' }}>📊 Review Progress</h2>
      
      {/* Stats Overview */}
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
      
      {/* Rating Categories */}
      <div style={styles.ratingCategories}>
        <h3 style={{ marginBottom: '16px' }}>Filter by Rating:</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          <button
            style={{
              ...styles.filterBtn,
              background: selectedRating === null ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
            onClick={() => setSelectedRating(null)}
          >
            All ({allMessages.length})
          </button>
          <button
            style={{
              ...styles.filterBtn,
              background: selectedRating === 'unrated' ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
            onClick={() => setSelectedRating('unrated')}
          >
            Unrated ({getUnratedMessages().length})
          </button>
          {RATINGS.map(r => (
            <button
              key={r.id}
              style={{
                ...styles.filterBtn,
                background: selectedRating === r.id ? `${r.color}30` : 'transparent',
                borderColor: r.color,
              }}
              onClick={() => setSelectedRating(r.id)}
            >
              {r.emoji} {r.label} ({getMessagesByRating(r.id).length})
            </button>
          ))}
        </div>
        
        {/* Message List */}
        <div style={styles.messageList}>
          {(selectedRating === null 
            ? allMessages 
            : selectedRating === 'unrated'
              ? getUnratedMessages()
              : getMessagesByRating(selectedRating)
          ).map((msg, idx) => (
            <div key={idx} style={styles.reviewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{msg.burmese}</div>
                  <div style={{ color: '#fbbf24', fontSize: '14px', marginBottom: '4px' }}>
                    {msg.devanagari}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>{msg.english}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {ratings[msg.id] && (
                    <span style={{ 
                      fontSize: '24px',
                      background: `${ratings[msg.id].color}30`,
                      padding: '4px 8px',
                      borderRadius: '8px',
                    }}>
                      {ratings[msg.id].emoji}
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
          ))}
        </div>
      </div>
    </div>
  );
};

// Converter Debug View - For developing the conversion logic
const ConverterDebugView = () => {
  const [inputText, setInputText] = useState('မင်္ဂလာပါ');
  const [debugResult, setDebugResult] = useState({ result: '', steps: [] });
  
  useEffect(() => {
    setDebugResult(convertBurmeseToDevanagariDebug(inputText));
  }, [inputText]);
  
  // Sample texts for testing
  const sampleTexts = [
    'မင်္ဂလာပါ',
    'နေကောင်းလား။',
    'ကောင်းပါတယ်။',
    'ဒါကောင်းတယ်။',
    'လက်ဖက်ရည်သောက်ချင်လား။',
  ];
  
  return (
    <div style={styles.converterContainer}>
      <h2 style={{ marginBottom: '24px' }}>🔧 Converter Debug Tool</h2>
      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
        Use this tool to test and improve the Burmese → Devanagari conversion logic.
      </p>
      
      {/* Input */}
      <div style={styles.converterInput}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>
          Enter Burmese text:
        </label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={styles.quizInput}
          placeholder="Type Burmese text..."
        />
      </div>
      
      {/* Quick samples */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '14px' }}>Quick samples:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sampleTexts.map((text, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(text)}
              style={styles.sampleBtn}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      
      {/* Result */}
      <div style={styles.converterResult}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Input:</div>
          <div style={{ fontSize: '24px' }}>{inputText}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Output (Devanagari):</div>
          <div style={{ fontSize: '24px', color: '#fbbf24' }}>{debugResult.result}</div>
          {debugResult.isSpecialCase && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px 12px', 
              background: 'rgba(34, 197, 94, 0.2)', 
              borderRadius: '8px',
              color: '#22c55e',
              fontSize: '14px',
            }}>
              ✨ Special case match - using predefined pronunciation
            </div>
          )}
        </div>
      </div>
      
      {/* Step by step breakdown */}
      <div style={styles.stepsContainer}>
        <h3 style={{ marginBottom: '16px' }}>Conversion Steps:</h3>
        <div style={styles.stepsTable}>
          <div style={styles.stepsHeader}>
            <div style={{ flex: 1 }}>Step</div>
            <div style={{ flex: 2 }}>Matched</div>
            <div style={{ flex: 2 }}>Converted</div>
            <div style={{ flex: 1 }}>Status</div>
          </div>
          {debugResult.steps.map((step, idx) => (
            <div 
              key={idx} 
              style={{
                ...styles.stepsRow,
                background: step.unmatched ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              }}
            >
              <div style={{ flex: 1 }}>{idx + 1}</div>
              <div style={{ flex: 2, fontSize: '18px' }}>{step.matched}</div>
              <div style={{ flex: 2, fontSize: '18px', color: '#fbbf24' }}>{step.converted}</div>
              <div style={{ flex: 1 }}>
                {step.unmatched ? '⚠️ No match' : '✓'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Special Cases Reference */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>✨ Special Cases ({Object.keys(SPECIAL_CASES).length} exceptions):</h3>
        <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
          These words have custom pronunciations that override the standard conversion rules.
        </p>
        <div style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          {Object.entries(SPECIAL_CASES).map(([burmese, devanagari], idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '18px' }}>{burmese}</span>
              <span style={{ fontSize: '18px', color: '#fbbf24' }}>→ {devanagari}</span>
            </div>
          ))}
          {Object.keys(SPECIAL_CASES).length === 0 && (
            <div style={{ color: '#64748b', textAlign: 'center' }}>No special cases defined yet</div>
          )}
        </div>
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.1)', 
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          color: '#94a3b8',
        }}>
          <strong style={{ color: '#3b82f6' }}>💡 How to add special cases:</strong>
          <br /><br />
          When you find a word that doesn't convert correctly, add it to the <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>SPECIAL_CASES</code> object in the code:
          <pre style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginTop: '12px',
            overflow: 'auto',
          }}>
{`const SPECIAL_CASES = {
  'မင်္ဂလာပါ': 'मिं2ग1ला2बा2',
  'newBurmeseWord': 'correctDevanagari',
};`}
          </pre>
        </div>
      </div>

      {/* Lookup Table Reference */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>📋 Lookup Table ({Object.keys(LOOKUP_TABLE).length} patterns):</h3>
        
        {/* Medial Combinations */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', color: '#a855f7' }}>
            🔗 Medial Combinations ({Object.keys(MEDIAL_COMBINATIONS).length} patterns) - Highest Priority
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
            Consonant + Medial (ျ ြ ှ ွ ွှ) combinations that override individual character conversion
          </p>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto', 
            background: 'rgba(168, 85, 247, 0.1)', 
            borderRadius: '12px',
            padding: '12px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '6px' }}>
              {Object.entries(MEDIAL_COMBINATIONS).slice(0, 40).map(([burmese, marathi], idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '6px 8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <span>{burmese}</span>
                  <span style={{ color: '#fbbf24', marginLeft: '4px' }}>→ {marathi}</span>
                </div>
              ))}
            </div>
            {Object.keys(MEDIAL_COMBINATIONS).length > 40 && (
              <div style={{ marginTop: '12px', color: '#64748b', textAlign: 'center', fontSize: '12px' }}>
                ... and {Object.keys(MEDIAL_COMBINATIONS).length - 40} more
              </div>
            )}
          </div>
        </div>
        
        {/* All patterns */}
        <h4 style={{ marginBottom: '12px', color: '#3b82f6' }}>
          📚 All Patterns (sorted by length for longest-match-first)
        </h4>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
            {SORTED_PATTERNS.slice(0, 50).map((pattern, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <span style={{ marginRight: '8px' }}>{pattern}</span>
                <span style={{ color: '#fbbf24' }}>→ {LOOKUP_TABLE[pattern]}</span>
              </div>
            ))}
          </div>
          {SORTED_PATTERNS.length > 50 && (
            <div style={{ marginTop: '16px', color: '#64748b', textAlign: 'center' }}>
              ... and {SORTED_PATTERNS.length - 50} more patterns
            </div>
          )}
        </div>
      </div>
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
    flexWrap: 'wrap',
    gap: '16px',
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
    flexWrap: 'wrap',
  },
  navTab: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    fontSize: '12px',
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
  optionBtnWrong: {
    background: 'rgba(239, 68, 68, 0.3)',
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
  difficultySelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
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
  quizBurmese: {
    fontSize: '32px',
    marginBottom: '16px',
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
    boxSizing: 'border-box',
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
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
    textAlign: 'left',
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
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Review styles
  reviewContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f59e0b',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '14px',
    marginTop: '4px',
  },
  ratingCategories: {},
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '13px',
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  reviewCard: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '16px',
  },
  // Converter styles
  converterContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  converterInput: {
    marginBottom: '24px',
  },
  converterResult: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  sampleBtn: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '16px',
  },
  stepsContainer: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '20px',
  },
  stepsTable: {
    fontSize: '14px',
  },
  stepsHeader: {
    display: 'flex',
    padding: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    marginBottom: '8px',
    fontWeight: '600',
  },
  stepsRow: {
    display: 'flex',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '4px',
  },
};
