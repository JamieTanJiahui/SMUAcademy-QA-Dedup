import * as XLSX from 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm';

export const downloadExcel = (data) => {
  // Add headers for the columns
  const headers = [
    "Inputted Course Title", 
    "Compared Course Title", 
    "Inputted Course Description", 
    "Compared Course Description", 
    "Inputted Course Objective", 
    "Compared Course Objective", 
    "Similarity Index"
  ];
  
  // Add headers as the first row to the data
  const formattedData = [headers, ...data.map(course => [
    course["Inputted Course Title"],
    course["Compared Course Title"],
    course["Inputted Course Description"],
    course["Compared Course Description"],
    course["Inputted Course Objective"],
    course["Compared Course Objective"],
    course["Similarity Index"]
  ])];

  // Convert data to worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(formattedData);
  
  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Similar Courses");
  
  // Generate buffer
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create a Blob from the buffer
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // Create a link element and trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'similar_courses.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
