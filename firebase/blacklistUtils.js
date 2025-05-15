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
  const inputWords = inputText.toLowerCase().split(/\s+/);
  return inputWords.filter(word => blacklistedWords.includes(word));
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
