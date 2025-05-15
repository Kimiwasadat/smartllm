import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// 🔍 Get all blacklisted words
export async function getBlacklistedWords() {
  const querySnapshot = await getDocs(collection(db, 'blacklistedWords'));
  const words = [];
  querySnapshot.forEach((doc) => {
    const word = doc.data().word;
    if (word) words.push(word.toLowerCase());
  });
  return new Set(words);
}

// ❌ Check if submitted text contains blacklisted words
export async function checkForBlacklistedWords(inputText) {
  const blacklistedWords = await getBlacklistedWords();
  let hasBlacklistedWords = false;
  let blacklistedCount = 0;
  let censoredText = inputText;

  // Convert to array and sort by length (longest first) to handle overlapping words
  const blacklistedArray = Array.from(blacklistedWords).sort((a, b) => b.length - a.length);

  // Process each blacklisted word
  for (const blacklistedWord of blacklistedArray) {
    // Create a regex that matches whole words only, case insensitive
    const wordRegex = new RegExp(`\\b${escapeRegExp(blacklistedWord)}\\b`, 'gi');
    
    // Find all matches to count characters accurately
    const matches = censoredText.match(wordRegex);
    if (matches) {
      hasBlacklistedWords = true;
      // Count actual characters in matched words
      matches.forEach(match => {
        blacklistedCount += match.length;
      });
      // Replace with asterisks preserving the original length
      censoredText = censoredText.replace(wordRegex, match => '*'.repeat(match.length));
    }
  }

  return {
    hasBlacklistedWords,
    blacklistedCount,
    censoredText
  };
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 📝 Propose a new word (from user)
export async function proposeBlacklistedWord(word, userId) {
  return await addDoc(collection(db, 'proposedWords'), {
    word: word.toLowerCase(),
    submittedBy: userId,
    status: 'pending',
    timestamp: new Date()
  });
}

// ✅ Admin approves a word
export async function approveWord(docId, word) {
  await addDoc(collection(db, 'blacklistedWords'), { word: word.toLowerCase() });
  await deleteDoc(doc(db, 'proposedWords', docId));
}
