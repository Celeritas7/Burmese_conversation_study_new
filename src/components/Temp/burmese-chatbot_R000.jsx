import React, { useState } from 'react';
import { ArrowRight, BookOpen, Plus, Trash2 } from 'lucide-react';

/**
 * BurmeseConverter Component
 * 
 * Main UI component for converting Burmese text to Devanagari script.
 * 
 * Features:
 * - Real-time text conversion
 * - Word-by-word breakdown display
 * - Custom character mapping support
 * - Sample text quick-select
 * 
 * Algorithm: Longest-match-first for accurate multi-character sequence handling
 */
const BurmeseConverter = () => {
  // State management
  const [burmeseInput, setBurmeseInput] = useState('');
  const [devanagariOutput, setDevanagariOutput] = useState('');
  const [breakdown, setBreakdown] = useState([]);
  const [customMappings, setCustomMappings] = useState([]);
  const [newBurmese, setNewBurmese] = useState('');
  const [newDevanagari, setNewDevanagari] = useState('');

  /**
   * Character Database
   * Sorted by length (longest first) for proper matching precedence
   * 
   * Format: { burmese: string, devanagari: string, meaning: string }
   * 
   * Note: This should eventually be moved to src/data/characterDatabase.js
   * for better maintainability
   */
  const characterDatabase = [
    // Complex multi-character sequences (longest first for proper matching)
    { burmese: 'မင်္ဂလာပါ', devanagari: 'मिंग्गालाबा२', meaning: 'Hello' },
    { burmese: 'ဘာလုပ်ကြမလဲ', devanagari: 'बा२लोपजा१म१ले३¹१३', meaning: 'What shall we do?' },
    { burmese: 'ဘာစားကြမလဲ', devanagari: 'बा२झा३जा१म१ले३¹१३', meaning: 'What shall we eat?' },
    { burmese: 'ဘယ်တောလာမလဲ', devanagari: 'बे३¹१२दौ३ला२म१ले३¹१३', meaning: 'When will you come?' },
    { burmese: 'ဘာလုပ်ချင်လဲ', devanagari: 'बा२लोपछिन२ले³¹१३', meaning: 'What do you want to do?' },
    { burmese: 'ဘာလိုချင်လဲ', devanagari: 'बा२लो२छिन२ले³¹१३', meaning: 'What do you want?' },
    { burmese: 'ဘာဖြစ်လို့လဲ', devanagari: 'बा२फ्ये?२लो१ले³¹१३', meaning: 'Why? What\'s the matter?' },
    { burmese: 'ဒါလိုချင်တယ်', devanagari: 'दा२लो२छिन२दे³¹१२', meaning: 'I want this one!' },
    { burmese: 'ကောင်းပါတယ်', devanagari: 'कोन्३बा१२दें२', meaning: 'I\'m fine' },
    { burmese: 'ဘယ်နှယောက်လဲ', devanagari: 'बे³¹१२न्ह१यौतले³¹१३', meaning: 'How many people?' },
    { burmese: 'ဆိုက်ကားဆရာ', devanagari: 'साइगा३झ१या२', meaning: 'trishaw driver' },
    { burmese: 'ဘာကြောင့်လဲ', devanagari: 'बा२चौन१ले³¹१३', meaning: 'Why? What\'s the reason?' },
    { burmese: 'ဘယ်ဟာလဲ', devanagari: 'बे³¹१२हा२ले³¹१३', meaning: 'Which one?' },
    { burmese: 'ဘယ်သူလဲ', devanagari: 'बे३¹१२दु२ले³¹१३', meaning: 'Who?' },
    { burmese: 'စာရေးဆရာ', devanagari: 'सा२ये३झ१या२', meaning: 'a writer' },
    { burmese: 'ဆရာတော်', devanagari: 'स१या२दौ२', meaning: 'Venerable Monk' },
    
    // Medium-length sequences
    { burmese: 'မင်္ဂ', devanagari: 'मिं', meaning: 'ming' },
    { burmese: 'ပါတယ်', devanagari: 'बा२दे³¹१२', meaning: 'affirmation' },
    { burmese: 'ဆရာမ', devanagari: 'स१या२म१', meaning: 'female teacher' },
    { burmese: 'ဆရာ', devanagari: 'स१या२', meaning: 'teacher' },
    { burmese: 'ဘာလဲ', devanagari: 'बा२ले³¹१३', meaning: 'What?' },
    { burmese: 'ဒါပဲ', devanagari: 'दा२बे³¹१३', meaning: 'This is the one!' },
    { burmese: 'သူပဲ', devanagari: 'थु२बे³¹१३', meaning: 'That\'s him!' },
    { burmese: 'လာ', devanagari: 'ला', meaning: 'la' },
    { burmese: 'ပါ', devanagari: 'बा२', meaning: 'polite ending' },
    { burmese: 'ကြ', devanagari: 'जा१', meaning: 'plural form' },
    
    // Single consonants (base characters)
    { burmese: 'က', devanagari: 'क', meaning: 'ka' },
    { burmese: 'ခ', devanagari: 'ख', meaning: 'kha' },
    { burmese: 'ဂ', devanagari: 'ग', meaning: 'ga' },
    { burmese: 'ဃ', devanagari: 'घ', meaning: 'gha' },
    { burmese: 'င', devanagari: 'ङ', meaning: 'nga' },
    { burmese: 'စ', devanagari: 'स', meaning: 'sa' },
    { burmese: 'ဆ', devanagari: 'स', meaning: 'sa' },
    { burmese: 'ဇ', devanagari: 'ज', meaning: 'ja' },
    { burmese: 'ဈ', devanagari: 'झ', meaning: 'jha' },
    { burmese: 'ည', devanagari: 'ज्ञ', meaning: 'ña' },
    { burmese: 'ဉ', devanagari: 'ज्ञ', meaning: 'ña' },
    { burmese: 'ဋ', devanagari: 'ट', meaning: 'ṭa' },
    { burmese: 'ဌ', devanagari: 'ठ', meaning: 'ṭha' },
    { burmese: 'ဍ', devanagari: 'ड', meaning: 'ḍa' },
    { burmese: 'ဎ', devanagari: 'ढ', meaning: 'ḍha' },
    { burmese: 'ဏ', devanagari: 'न', meaning: 'ṇa' },
    { burmese: 'တ', devanagari: 'त', meaning: 'ta' },
    { burmese: 'ထ', devanagari: 'थ', meaning: 'tha' },
    { burmese: 'ဒ', devanagari: 'द', meaning: 'da' },
    { burmese: 'ဓ', devanagari: 'ध', meaning: 'dha' },
    { burmese: 'န', devanagari: 'न', meaning: 'na' },
    { burmese: 'ပ', devanagari: 'प', meaning: 'pa' },
    { burmese: 'ဖ', devanagari: 'फ', meaning: 'pha' },
    { burmese: 'ဗ', devanagari: 'ब', meaning: 'ba' },
    { burmese: 'ဘ', devanagari: 'ब', meaning: 'bha' },
    { burmese: 'မ', devanagari: 'म', meaning: 'ma' },
    { burmese: 'ယ', devanagari: 'य', meaning: 'ya' },
    { burmese: 'ရ', devanagari: 'य', meaning: 'ra' },
    { burmese: 'လ', devanagari: 'ल', meaning: 'la' },
    { burmese: 'ဝ', devanagari: 'व', meaning: 'va' },
    { burmese: 'သ', devanagari: 'थ', meaning: 'tha' },
    { burmese: 'ဟ', devanagari: 'ह', meaning: 'ha' },
    { burmese: 'ဠ', devanagari: 'ल', meaning: 'la' },
    { burmese: 'အ', devanagari: 'अ', meaning: 'a' },
  ].sort((a, b) => b.burmese.length - a.burmese.length); // Critical: Sort by length descending

  /**
   * Conversion Engine - Core Algorithm
   * 
   * Implements "longest-match-first" algorithm:
   * 1. Process text left-to-right
   * 2. At each position, try longest matches first
   * 3. When match found, append to result and advance position
   * 4. If no match, mark as unknown and advance by 1
   * 
   * @param {string} text - Input Burmese text
   */
  const convertText = (text) => {
    if (!text.trim()) {
      setDevanagariOutput('');
      setBreakdown([]);
      return;
    }

    let result = '';
    let breakdownList = [];
    let position = 0;
    
    // Combine custom mappings with database (custom first for override capability)
    const allMappings = [...customMappings, ...characterDatabase];

    // Main conversion loop
    while (position < text.length) {
      let matched = false;

      // Try to match from current position (longest first due to pre-sorting)
      for (let mapping of allMappings) {
        const burmeseLen = mapping.burmese.length;
        const segment = text.substring(position, position + burmeseLen);

        if (segment === mapping.burmese) {
          // Match found!
          result += mapping.devanagari;
          breakdownList.push({
            burmese: mapping.burmese,
            devanagari: mapping.devanagari,
            meaning: mapping.meaning || ''
          });
          position += burmeseLen;
          matched = true;
          break; // Stop trying shorter matches
        }
      }

      if (!matched) {
        // No match found - keep character as-is and mark as unknown
        const unknownChar = text[position];
        result += unknownChar;
        breakdownList.push({
          burmese: unknownChar,
          devanagari: '❓',
          meaning: 'Unknown character'
        });
        position++;
      }
    }

    setDevanagariOutput(result);
    setBreakdown(breakdownList);
  };

  /**
   * Trigger conversion when user clicks Convert button
   */
  const handleConvert = () => {
    convertText(burmeseInput);
  };

  /**
   * Add a custom character mapping
   * Allows users to extend the database without modifying code
   */
  const addCustomMapping = () => {
    if (newBurmese && newDevanagari) {
      const newMapping = {
        burmese: newBurmese,
        devanagari: newDevanagari,
        meaning: 'Custom mapping'
      };
      // Add to beginning for priority over default mappings
      setCustomMappings([newMapping, ...customMappings]);
      setNewBurmese('');
      setNewDevanagari('');
    }
  };

  /**
   * Remove a custom mapping by index
   */
  const removeCustomMapping = (index) => {
    setCustomMappings(customMappings.filter((_, i) => i !== index));
  };

  // Sample texts for quick testing
  const sampleTexts = [
    'မင်္ဂလာပါ',
    'ကောင်းပါတယ်',
    'ဘာလဲ',
    'ဒါဘာလဲ',
    'ဘာလုပ်ကြမလဲ'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            Burmese → Devanagari Converter
          </h1>
          <p className="text-gray-600">
            Type or paste Burmese text to convert to Devanagari script
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Converter Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Burmese Text Input:
              </label>
              <textarea
                value={burmeseInput}
                onChange={(e) => setBurmeseInput(e.target.value)}
                className="w-full h-32 p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg resize-none"
                placeholder="Type Burmese text here... (e.g., မင်္ဂလာပါ)"
              />
              
              {/* Sample Text Quick-Select Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Try these:</span>
                {sampleTexts.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBurmeseInput(text)}
                    className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
              >
                Convert <ArrowRight size={20} />
              </button>
            </div>

            {/* Output Section - Only shown when there's output */}
            {devanagariOutput && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Devanagari Output:
                </label>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <p className="text-2xl font-semibold text-green-900">
                    {devanagariOutput}
                  </p>
                </div>
              </div>
            )}

            {/* Word-by-Word Breakdown Section */}
            {breakdown.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Word-by-Word Breakdown
                  </h3>
                </div>
                <div className="space-y-3">
                  {breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200"
                    >
                      <div className="text-lg font-medium text-gray-800 min-w-[100px]">
                        {item.burmese}
                      </div>
                      <ArrowRight size={16} className="text-amber-600" />
                      <div className="text-xl font-semibold text-indigo-700 min-w-[100px]">
                        {item.devanagari}
                      </div>
                      {item.meaning && (
                        <div className="text-sm text-gray-600 italic">
                          ({item.meaning})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Custom Mappings & Info */}
          <div className="space-y-6">
            {/* Custom Mapping Tool */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add Custom Mapping
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newBurmese}
                  onChange={(e) => setNewBurmese(e.target.value)}
                  placeholder="Burmese text"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={newDevanagari}
                  onChange={(e) => setNewDevanagari(e.target.value)}
                  placeholder="Devanagari text"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={addCustomMapping}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Mapping
                </button>
              </div>

              {/* Display Custom Mappings */}
              {customMappings.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Your Custom Mappings:
                  </h4>
                  <div className="space-y-2">
                    {customMappings.map((mapping, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{mapping.burmese}</span>
                          {' → '}
                          <span className="font-medium text-indigo-600">
                            {mapping.devanagari}
                          </span>
                        </div>
                        <button
                          onClick={() => removeCustomMapping(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">
                How It Works
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">1.</span>
                  <span>Uses "longest match first" algorithm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">2.</span>
                  <span>Processes text left-to-right naturally</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">3.</span>
                  <span>Add custom mappings for missing characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">4.</span>
                  <span>Shows word-by-word breakdown</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BurmeseConverter;