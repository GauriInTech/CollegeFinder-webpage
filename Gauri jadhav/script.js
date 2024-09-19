let colleges = []; // This will hold the data fetched from the API
let currentPage = 1; // Tracks the current page
const itemsPerPage = 10; // Number of colleges to display per page

// Function to display colleges with pagination
function displayColleges(collegesToDisplay) {
    const collegeList = document.getElementById('collegeList');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const paginatedColleges = collegesToDisplay.slice(startIndex, endIndex);
    
    collegeList.innerHTML = buildCollegesHTML(paginatedColleges);
    updatePaginationControls(collegesToDisplay.length); // Update pagination buttons
}

// Function to update pagination controls (Next/Previous)
function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationControls = document.getElementById('paginationControls');
    
    paginationControls.innerHTML = `
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
}

// Function to change pages
function changePage(direction) {
    const totalPages = Math.ceil(colleges.length / itemsPerPage);

    if (direction === 1 && currentPage < totalPages) {
        currentPage++;
    } else if (direction === -1 && currentPage > 1) {
        currentPage--;
    }

    displayColleges(colleges); // Re-display the colleges based on the new page
}

// Function to filter colleges based on search and course filter
function filterColleges() {
    currentPage = 1; // Reset to the first page whenever filtering
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const courseFilter = document.getElementById('courseFilter').value;

    const filteredColleges = colleges.filter(college => {
        const matchesSearch = college.college.toLowerCase().includes(searchInput);
        const matchesCourse = courseFilter === '' || (college.courses && college.courses.includes(courseFilter));

        return matchesSearch && matchesCourse;
    });

    displayColleges(filteredColleges); // Display filtered colleges
}

// Fetch data from API.json
fetch('API.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        colleges = data.map(college => ({
            college: formatText(college.college_name),   // Correcting field names
            address: formatText(college.address),
            contact_number: formatText(college.contact_number),
            email: formatText(college.email),
            courses: college.courses // Keeping this as it is already an array
        }));
        displayColleges(colleges); // Initially display all colleges
    })
    .catch(error => {
        console.error('Error fetching data from API.json:', error);
        alert('Error fetching data. Please check the console for details.');
    });

// Function to format text (you should define this function as needed)
function formatText(text) {
    return text ? text.trim() : ''; // Example: trims any extra spaces
}

// Function to build the HTML for displaying colleges
function buildCollegesHTML(colleges) {
    return colleges.map(college => `
        <div class="college">
            <h3>${college.college}</h3>
            <p>Address: ${college.address}</p>
            <p>Contact: ${college.contact_number}</p>
            <p>Email: ${college.email}</p>
            <p>Courses: ${college.courses.join(', ')}</p>
        </div>
    `).join('');
}