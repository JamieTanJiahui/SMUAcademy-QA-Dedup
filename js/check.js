import { searchSimilarCourses } from './similarityCheck.js'; // Ensure the path is correct
import { downloadExcel } from './exportExcel.js';

// Handle form submission
document.getElementById("courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const searchCriteria = document.querySelector('input[name="searchBy"]:checked').value; // Selected search criteria
  const searchTerm = document.getElementById("searchTerm").value; // Input search term
  const inputObjective = document.getElementById("inputObjective").value; // Input course objective
  const inputDescription = document.getElementById("inputDescription").value; // Input course description

  try {
    const similarCourses = await searchSimilarCourses(searchTerm, searchCriteria);

    const table = document.getElementById("similarCoursesTable");
    const downloadButton = document.getElementById("downloadExcel");
    table.innerHTML = ""; // Clear previous results

    // If no courses found
    if (similarCourses.length === 0) {
      table.innerHTML = "<tr><td colspan='7' class='text-center'>No courses found</td></tr>";
      downloadButton.style.display = "none";
    } else {
      // Create table headers
      table.innerHTML = `
        <thead>
          <tr>
            <th>Inputted Course Title</th>
            <th>Compared Course Title</th>
            <th>Inputted Course Description</th>
            <th>Compared Course Description</th>
            <th>Inputted Course Objective</th>
            <th>Compared Course Objective</th>
            <th>Similarity Index</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector("tbody");

      // Populate table rows with search results
      similarCourses.forEach((item) => {
        const course = item.course; // Get the course data from the item
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${searchTerm}</td> <!-- Input course title -->
          <td>${course.Title}</td> <!-- Compared course title -->
          <td>${inputDescription}</td> <!-- Input course description -->
          <td>${course.Description}</td> <!-- Compared course description -->
          <td>${inputObjective}</td> <!-- Input course objective -->
          <td>${course.Objective}</td> <!-- Compared course objective -->
          <td>${item.similarity.toFixed(2)}</td> <!-- Similarity index -->
        `;
        tbody.appendChild(row);
      });

      // Show download button
      downloadButton.style.display = "block";

      // Add event listener to download the results
      downloadButton.addEventListener("click", () => {
        const exportData = similarCourses.map((item) => ({
          "Inputted Course Title": searchTerm,
          "Compared Course Title": item.course.Title,
          "Inputted Course Description": inputDescription,
          "Compared Course Description": item.course.Description,
          "Inputted Course Objective": inputObjective,
          "Compared Course Objective": item.course.Objective,
          "Similarity Index": item.similarity.toFixed(2),
        }));
        downloadExcel(exportData, "SimilarCourses.xlsx");
      });
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
});


