import { db, collection, getDocs } from './database.js';

// Levenshtein distance function for string similarity calculation
export const calculateSimilarity = (courseField, inputField) => {
  const a = courseField.toLowerCase();
  const b = inputField.toLowerCase();

  const alen = a.length;
  const blen = b.length;

  if (!alen || !blen) return 0;

  const dp = Array.from({ length: alen + 1 }, () => Array(blen + 1).fill(0));

  for (let i = 0; i <= alen; i++) dp[i][0] = i;
  for (let j = 0; j <= blen; j++) dp[0][j] = j;

  for (let i = 1; i <= alen; i++) {
    for (let j = 1; j <= blen; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }

  const distance = dp[alen][blen];
  const similarity = 1 - distance / Math.max(alen, blen);
  return similarity; // Return similarity as a value between 0 and 1
};

// Function to highlight matching phrases in a given text
export const highlightPhrases = (inputText, courseText, color = "yellow") => {
  const minPhraseLength = 4; // Minimum number of words for a phrase
  const inputWords = inputText.toLowerCase().split(/\s+/);
  const courseWords = courseText.toLowerCase().split(/\s+/);

  const phrasesToMatch = new Set();

  // Generate phrases (n-grams) of at least `minPhraseLength` words from input text
  for (let i = 0; i <= inputWords.length - minPhraseLength; i++) {
    for (let j = minPhraseLength; j <= inputWords.length - i; j++) {
      const phrase = inputWords.slice(i, i + j).join(" ");
      phrasesToMatch.add(phrase);
    }
  }

  // Highlight matching phrases in the course text
  let highlightedText = courseText;
  phrasesToMatch.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi"); // Match whole phrases
    highlightedText = highlightedText.replace(regex, `<mark style="background-color: ${color};">${phrase}</mark>`);
  });

  return highlightedText;
};


// Function to fetch courses and compare similarity
export const searchSimilarCourses = async (inputSearchTerm, inputDescription, inputObjective) => {
  const collections = ["BM", "FIT", "SOBI", "HCML"];
  const allSimilarities = [];

  for (const collectionName of collections) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    snapshot.forEach(doc => {
      const course = doc.data();

      // Calculate similarity scores
      const titleSimilarity = calculateSimilarity(course.Title || "", inputSearchTerm);
      const descriptionSimilarity = calculateSimilarity(course.Description || "", inputDescription);
      const objectiveSimilarity = calculateSimilarity(course.Objective || "", inputObjective);

      const combinedSimilarity = (titleSimilarity + descriptionSimilarity + objectiveSimilarity) / 3;

      // Only include courses with sufficient similarity
      if (combinedSimilarity >= 0.7) {
        // Highlight phrases in the inputted course fields using the compared course fields
        const highlightedInputDescription = highlightPhrases(inputDescription, inputDescription, "yellow");
        const highlightedInputObjective = highlightPhrases(inputObjective, inputObjective, "lightblue");

        // Highlight phrases in the compared course fields using the inputted course fields
        const highlightedCourseDescription = highlightPhrases(course.Description || "", inputDescription, "yellow");
        const highlightedCourseObjective = highlightPhrases(course.Objective || "", inputObjective, "lightblue");

        allSimilarities.push({
          course,
          similarity: parseFloat(combinedSimilarity.toFixed(3)),
          highlightedInputDescription,
          highlightedInputObjective,
          highlightedCourseDescription,
          highlightedCourseObjective,
        });
      }
    });
  }

  return allSimilarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
};
