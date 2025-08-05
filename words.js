// Danish 5-letter words for Wordle
const fs = require('fs');
const path = require('path');

// Angiv stien til ordlisten
const filePath = path.join(__dirname, 'ordliste.txt');

// Synkron læsning og splitting
const DANISH_WORDS = fs.readFileSync(filePath, 'utf8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0); // Fjerner tomme linjer


// Get today's word based on date
function getTodaysWord() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return DANISH_WORDS[dayOfYear % DANISH_WORDS.length];
}

// Check if word is valid
function isValidWord(word) {
  return DANISH_WORDS.includes(word.toLowerCase());
}

module.exports = {
  getTodaysWord,
  isValidWord,
  DANISH_WORDS
};