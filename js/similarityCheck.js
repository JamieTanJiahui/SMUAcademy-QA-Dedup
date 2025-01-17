import { db, collection, getDocs } from './database.js';

// Levenshtein distance function for string similarity calculation
export const calculateSimilarity = (courseField, inputField) => {
  const a = courseField.toLowerCase();
  const b = inputField.toLowerCase();

  const alen = a.length;
  const blen = b.length;

  // Handle edge cases for empty strings
  if (!alen || !blen) return 0;

  // Create a 2D array for storing distances
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

  console.log(`Calculating similarity for: "${courseField}" vs "${inputField}"`);
  console.log(`Levenshtein Distance: ${distance}, Similarity: ${similarity}`);

  return similarity; // Return similarity as a value between 0 and 1
};

// Function to fetch courses and compare similarity
export const searchSimilarCourses = async (inputSearchTerm, searchCriteria) => {
  console.log("Starting searchSimilarCourses function...");
  console.log(`Input Search Term: ${inputSearchTerm}`);
  console.log(`Search Criteria: ${searchCriteria}`);

  const collections = ["BM", "FIT", "SOBI", "HCML"]; // List of collections
  const allSimilarities = [];

  // Loop through each collection
  for (const collectionName of collections) {
    console.log(`Accessing collection: ${collectionName}`);
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    console.log(`Fetched ${snapshot.size} documents from collection: ${collectionName}`);

    // Loop through each document in the collection
    snapshot.forEach(doc => {
      const course = doc.data(); // Get document data
      console.log(`Processing document ID: ${doc.id}`);
      console.log(`Document Data:`, course);

      const courseField = course[searchCriteria]; // Fetch the field based on the search criteria

      if (courseField) {
        console.log(`Value of '${searchCriteria}' field: ${courseField}`);
        const similarity = calculateSimilarity(courseField, inputSearchTerm);
        console.log(`Calculated Similarity: ${similarity}`);

        allSimilarities.push({
          course,
          similarity,
          courseTitle: course.Title, // Store course title
          coursePillar: collectionName // Store collection (pillar)
        });
      } else {
        console.warn(`Field '${searchCriteria}' is missing in document ID: ${doc.id}`);
      }
    });
  }

  // Sort by similarity and return top 10
  const topCourses = allSimilarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  console.log(`Total courses processed: ${allSimilarities.length}`);
  console.log("Top 10 Similar Courses:", topCourses);

  return topCourses; // Return top 10 results
};

