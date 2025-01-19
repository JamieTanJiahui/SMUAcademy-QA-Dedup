import { highlightPhrases, searchSimilarCourses } from './similarityCheck.js';
import { downloadExcel } from './exportExcel.js';
import { db, doc, getDoc } from './database.js';

// Helper function to highlight text with a given color
function highlightText(text, highlightedText, color) {
    return `<span style="background-color: ${color};">${highlightedText}</span>`;
}

document.getElementById("courseForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const searchTerm = document.getElementById("searchTerm").value.trim();

    // List of collections to search through
    const collections = ["BM", "FIT", "HCML", "SOBI"];

    let inputCourse = null;

    try {
        // Show the loading bar
        document.getElementById("loadingBarContainer").style.display = "block";

        // Loop through collections and search for the course document
        for (let collectionName of collections) {
            const courseDocRef = doc(db, collectionName, searchTerm);
            const courseDoc = await getDoc(courseDocRef);

            if (courseDoc.exists()) {
                inputCourse = courseDoc.data();
                break; // Exit the loop once the course is found
            }
        }

        if (!inputCourse) {
            console.error("No course found with the given title.");
            alert("No course found with the given title. Please try again.");
            return;
        }

        const inputDescription = inputCourse.Description || ""; // Default to empty string if no description exists
        const inputObjective = inputCourse.Objective || ""; // Default to empty string if no objective exists

        // Perform similarity search
        const similarCourses = await searchSimilarCourses(searchTerm, inputDescription, inputObjective);

        const table = document.getElementById("similarCoursesTable");
        const downloadButton = document.getElementById("downloadExcel");
        table.innerHTML = "";

        if (similarCourses.length === 0) {
            table.innerHTML = "<tr><td colspan='7' class='text-center'>No courses found</td></tr>";
            downloadButton.style.display = "none";
        } else {
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Inputted Course Title</th>
                        <th>Description of Inputted Course</th>
                        <th>Objective of Inputted Course</th>
                        <th>Compared Course Title</th>
                        <th>Highlighted Compared Description</th>
                        <th>Highlighted Compared Objective</th>
                        <th>Similarity Index</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector("tbody");
            similarCourses.forEach(item => {
                // Directly use the highlighted descriptions and objectives
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${inputCourse.Title}</td>
                    <td>${highlightText(inputDescription, item.highlightedDescription, "yellow")}</td>
                    <td>${highlightText(inputObjective, item.highlightedObjective, "lightblue")}</td>
                    <td>${item.course.Title || "-"}</td>
                    <td>${item.highlightedDescription || "-"}</td>
                    <td>${item.highlightedObjective || "-"}</td>
                    <td>${item.similarity.toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });

            downloadButton.style.display = "block";

            downloadButton.addEventListener("click", () => {
                const exportData = similarCourses.map(item => ({
                    "Inputted Course Title": inputCourse.Title,
                    "Compared Course Title": item.course.Title || "-",
                    "Inputted Course Description": inputDescription || "-",
                    "Compared Course Description": item.highlightedDescription || "-",
                    "Inputted Course Objective": inputObjective || "-",
                    "Compared Course Objective": item.highlightedObjective || "-",
                    "Similarity Index": item.similarity.toFixed(2),
                }));
                downloadExcel(exportData); // Pass the formatted data with HTML tags to export
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

