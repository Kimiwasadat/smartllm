import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// 🔍 Get all blacklisted words
export async function getBlacklistedWords() {
  try {
    if (!db) {
      console.error('Firestore not initialized');
      return new Set();
    }

    const querySnapshot = await getDocs(collection(db, 'blacklistedWords'));
    const words = [];
    querySnapshot.forEach((doc) => {
      const word = doc.data().word;
      if (word) words.push(word.toLowerCase());
    });
    return new Set(words);
  } catch (error) {
    console.error('Error fetching blacklisted words:', error);
    return new Set(); // Return empty set on error
  }
}

// ❌ Check if submitted text contains blacklisted words
export async function checkForBlacklistedWords(inputText) {
  try {
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
  } catch (error) {
    console.error('Error checking for blacklisted words:', error);
    return {
      hasBlacklistedWords: false,
      blacklistedCount: 0,
      censoredText: inputText
    };
  }
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 📝 Propose a new word (from user)
export async function proposeBlacklistedWord(word, userId) {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    return await addDoc(collection(db, 'proposedWords'), {
      word: word.toLowerCase(),
      submittedBy: userId,
      status: 'pending',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error proposing blacklisted word:', error);
    throw error;
  }
}

// ✅ Admin approves a word
export async function approveWord(docId, word) {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    await addDoc(collection(db, 'blacklistedWords'), { word: word.toLowerCase() });
    await deleteDoc(doc(db, 'proposedWords', docId));
  } catch (error) {
    console.error('Error approving word:', error);
    throw error;
  }
}
