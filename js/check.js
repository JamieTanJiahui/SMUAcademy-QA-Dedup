import { searchSimilarCourses } from './similarityCheck.js';
import { downloadExcel } from './exportExcel.js';

document.getElementById("courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const searchTerm = document.getElementById("searchTerm").value.trim(); // Inputted course title
  const searchCriteria = "Title"; // We're only comparing course titles

  try {
    const similarCourses = await searchSimilarCourses(searchTerm, searchCriteria); // Pass 'Title' explicitly

    const table = document.getElementById("similarCoursesTable");
    const downloadButton = document.getElementById("downloadExcel");
    table.innerHTML = ""; // Clear previous results

    if (similarCourses.length === 0) {
      table.innerHTML = "<tr><td colspan='7' class='text-center'>No courses found</td></tr>";
      downloadButton.style.display = "none";
    } else {
      // Fetch the description and objectives of the inputted course title
      const inputtedCourse = similarCourses.find(course => course.course.Title === searchTerm);
      const inputtedDescription = inputtedCourse?.course.Description || "-";
      const inputtedObjective = inputtedCourse?.course.Objective || "-";

      // Define table headers
      table.innerHTML = `
        <thead>
          <tr>
            <th>Inputted Course Title</th>
            <th>Description of Inputted Course Title</th>
            <th>Objectives of Inputted Course Title</th>
            <th>Compared Course Title</th>
            <th>Description of Compared Course Title</th>
            <th>Objectives of Compared Course Title</th>
            <th>Similarity Index</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector("tbody");

      // Populate table rows with search results
      similarCourses.forEach(item => {
        const course = item.course;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${searchTerm}</td>
          <td>${inputtedDescription}</td>
          <td>${inputtedObjective}</td>
          <td>${course.Title || "-"}</td>
          <td>${course.Description || "-"}</td>
          <td>${course.Objective || "-"}</td>
          <td>${item.similarity.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });

      downloadButton.style.display = "block";

      // Add event listener to download the results
      downloadButton.addEventListener("click", () => {
        const exportData = similarCourses.map(item => ({
          "Inputted Course Title": searchTerm,
          "Description of Inputted Course Title": inputtedDescription,
          "Objectives of Inputted Course Title": inputtedObjective,
          "Compared Course Title": item.course.Title || "-",
          "Description of Compared Course Title": item.course.Description || "-",
          "Objectives of Compared Course Title": item.course.Objective || "-",
          "Similarity Index": item.similarity.toFixed(2),
        }));
        downloadExcel(exportData, "SimilarCourses.xlsx");
      });
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
});
