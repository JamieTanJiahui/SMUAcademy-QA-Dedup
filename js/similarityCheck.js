import { db, collection, getDocs, query, where } from './database.js';

// Similarity function (this can be adjusted based on how your similarity is calculated)
const calculateSimilarity = (courseDescription, inputDescription) => {
  // Use a string similarity algorithm (e.g., Jaccard, Levenshtein, Cosine Similarity, etc.)
  return 0.8; // Placeholder value for example, calculate the actual similarity
};

// Function to fetch courses and compare similarity
const searchSimilarCourses = async (inputSearchTerm, searchCriteria) => {
  const coursesRef = collection(db, "courses");

  const coursesSnapshot = await getDocs(coursesRef);
  const courses = coursesSnapshot.docs.map(doc => doc.data());

  const similarCourses = courses
    .filter(course => {
      let similarityScore = 0;
      if (searchCriteria === "title") {
        similarityScore = calculateSimilarity(course.title, inputSearchTerm);
      } else if (searchCriteria === "description") {
        similarityScore = calculateSimilarity(course.description, inputSearchTerm);
      } else if (searchCriteria === "objective") {
        similarityScore = calculateSimilarity(course.objective, inputSearchTerm);
      }

      return similarityScore >= 0.7;  // Filtering based on the threshold
    })
    .slice(0, 10);  // Get top 10 similar courses

  return similarCourses;
};

// Handle the form submission
document.getElementById("courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the search criteria and term from the form
  const searchCriteria = document.querySelector('input[name="searchBy"]:checked').value;
  const inputSearchTerm = document.getElementById("searchTerm").value;

  // Fetch and display the similar courses
  const similarCourses = await searchSimilarCourses(inputSearchTerm, searchCriteria);

  const coursesList = document.getElementById("similarCoursesList");
  coursesList.innerHTML = ""; // Clear any previous results

  if (similarCourses.length === 0) {
    coursesList.innerHTML = "<li class='list-group-item'>No similar courses found</li>";
  } else {
    similarCourses.forEach(course => {
      const similarityScore = calculateSimilarity(course[searchCriteria], inputSearchTerm);
      const listItem = document.createElement("li");
      listItem.classList.add("list-group-item");
      listItem.textContent = `Course: ${course.title} - Similarity Score: ${similarityScore.toFixed(2)}`;
      coursesList.appendChild(listItem);
    });
  }
});
