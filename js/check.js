import { highlightPhrases, searchSimilarCourses } from './similarityCheck.js';
import { downloadExcel } from './exportExcel.js';
import { db, doc, getDoc } from './database.js';

document.getElementById("courseForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const searchTerm = document.getElementById("searchTerm").value.trim();

    // List of collections to search through
    const collections = ["BM", "FIT", "HCML", "SOBI"];

    let inputCourse = null;

    try {
        // Show the loading bar
        document.getElementById("loadingBarContainer").style.display = "block";

        // Search for the inputted course
        for (let collectionName of collections) {
            const courseDocRef = doc(db, collectionName, searchTerm);
            const courseDoc = await getDoc(courseDocRef);

            if (courseDoc.exists()) {
                inputCourse = courseDoc.data();
                break;
            }
        }

        if (!inputCourse) {
            console.error("No course found with the given title.");
            alert("No course found with the given title. Please try again.");
            return;
        }

        const inputDescription = inputCourse.Description || "";
        const inputObjective = inputCourse.Objective || "";

        // Perform similarity search (with phrase highlighting)
        const similarCourses = await searchSimilarCourses(
            searchTerm,
            inputDescription,
            inputObjective
        );

        const table = document.getElementById("similarCoursesTable");
        const downloadButton = document.getElementById("downloadExcel");
        const resultsHeader = document.getElementById("resultsHeader");
        table.innerHTML = "";

        if (similarCourses.length === 0) {
            table.innerHTML = "<tr><td colspan='7' class='text-center'>No courses found</td></tr>";
            downloadButton.style.display = "none";
        } else {
            // Generate table headers
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Inputted Course Title</th>
                        <th>Highlighted Description of Inputted Course</th>
                        <th>Highlighted Objective of Inputted Course</th>
                        <th>Compared Course Title</th>
                        <th>Highlighted Compared Description</th>
                        <th>Highlighted Compared Objective</th>
                        <th>Similarity Index</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            // Populate the table with data
            const tbody = table.querySelector("tbody");
            similarCourses.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${inputCourse.Title}</td>
                    <td>${item.highlightedInputDescription || "-"}</td>
                    <td>${item.highlightedInputObjective || "-"}</td>
                    <td>${item.course.Title || "-"}</td>
                    <td>${item.highlightedCourseDescription || "-"}</td>
                    <td>${item.highlightedCourseObjective || "-"}</td>
                    <td>${item.similarity.toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
            

            // Show the results table and header
            resultsHeader.style.display = "block";
            table.style.display = "block";
            downloadButton.style.display = "block";

            // Set up download button
            downloadButton.addEventListener("click", () => {
                const exportData = similarCourses.map(item => ({
                    "Inputted Course Title": inputCourse.Title,
                    "Highlighted Inputted Course Description": item.highlightedInputDescription || "-",
                    "Highlighted Inputted Course Objective": item.highlightedInputObjective || "-",
                    "Compared Course Title": item.course.Title || "-",
                    "Highlighted Compared Course Description": item.highlightedCourseDescription || "-",
                    "Highlighted Compared Course Objective": item.highlightedCourseObjective || "-",
                    "Similarity Index": item.similarity.toFixed(2),
                }));
                downloadExcel(exportData);
            });
        }

        // Hide the loading bar after results are loaded
        document.getElementById("loadingBarContainer").style.display = "none";
    } catch (error) {
        console.error("Error fetching course or comparing similarities:", error);
        alert("An error occurred. Please check the console for details.");

        // Hide the loading bar in case of an error
        document.getElementById("loadingBarContainer").style.display = "none";
    }
});
