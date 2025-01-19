import { db, collection, getDocs, doc, getDoc } from './database.js';

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

// Function to fetch courses and compare similarity
export const searchSimilarCourses = async (inputSearchTerm) => {
  const collections = ["BM", "FIT", "SOBI", "HCML"];
  const allSimilarities = [];

  let inputCourse = null;

  // Retrieve the inputted course details
  for (const collectionName of collections) {
    const courseDocRef = doc(db, collectionName, inputSearchTerm);
    const courseDoc = await getDoc(courseDocRef);

    if (courseDoc.exists()) {
      inputCourse = courseDoc.data();
      break;
    }
  }

  if (!inputCourse) {
    throw new Error("No course found with the given title.");
  }

  const inputDescription = inputCourse.Description || "";
  const inputObjective = inputCourse.Objective || "";

  console.log("Input Course Description:", inputDescription);
  console.log("Input Course Objective:", inputObjective);

  // Compare the inputted course with all other courses in the database
  for (const collectionName of collections) {
    console.log(`Processing collection: ${collectionName}`);
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    snapshot.forEach(doc => {
      const course = doc.data();
      console.log(`Processing document: ${doc.id} in collection: ${collectionName}`);

      // Skip the inputted course itself
      if (course.Title === inputSearchTerm) return;

      // Calculate similarity scores
      const descriptionSimilarity = calculateSimilarity(course.Description || "", inputDescription);
      const objectiveSimilarity = calculateSimilarity(course.Objective || "", inputObjective);

      const combinedSimilarity = (descriptionSimilarity + objectiveSimilarity) / 2;

      console.log(`Course: ${course.Title}, Description Similarity: ${descriptionSimilarity}, Objective Similarity: ${objectiveSimilarity}, Combined Similarity: ${combinedSimilarity}`);

      // Only include courses with sufficient similarity
      if (combinedSimilarity > 0.7) {
        // Explanation for similarity
        const similarityExplanation = `Description Similarity: ${descriptionSimilarity.toFixed(2)}, Objective Similarity: ${objectiveSimilarity.toFixed(2)}`;

        console.log("Compared Course:", course.Title);
        console.log("Combined Similarity:", combinedSimilarity);
        console.log("Similarity Explanation:", similarityExplanation);

        allSimilarities.push({
          course,
          similarity: parseFloat(combinedSimilarity.toFixed(3)),
          similarityExplanation,
        });
      }
    });
  }

  console.log("All Similarities:", allSimilarities);

  return allSimilarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
};
