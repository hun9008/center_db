document.addEventListener("DOMContentLoaded", async function() {
    await loadFileList();
});

async function loadFileList() {
    try {
        const response = await fetch('http://localhost:8000/files');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const files = await response.json();
        
        const csvFilesDropdown = document.getElementById("csvFiles");
        csvFilesDropdown.innerHTML = '<option value="" selected disabled>파일을 선택하세요</option>';
        
        files.forEach(file => {
            const option = document.createElement("option");
            option.value = file;
            option.textContent = file;
            csvFilesDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function loadCSV() {
    const csvFile = document.getElementById("csvFiles").value;
    if (!csvFile) {
        return;
    }
    try {
        const response = await fetch(`http://localhost:8000/files/${encodeURIComponent(csvFile)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const csvData = await response.json();
        displayCSV(csvData);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function displayCSV(csvData) {
    const table = document.getElementById("csvTable");
    table.innerHTML = "";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Create the table header with sort functionality
    const headerRow = document.createElement("tr");
    csvData[0].forEach((header, index) => {
        const th = document.createElement("th");
        th.textContent = header;
        th.addEventListener("click", () => sortTable(index));
        th.classList.add('sortable');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create the table body
    csvData.slice(1).forEach(row => {
        const tr = document.createElement("tr");
        row.forEach(cell => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
}

// Store the current sort state for each column
let sortOrder = {};

function sortTable(columnIndex) {
    const table = document.getElementById("csvTable");
    const tbody = table.getElementsByTagName("tbody")[0];
    const rowsArray = Array.from(tbody.getElementsByTagName("tr"));

    if (!sortOrder[columnIndex]) {
        sortOrder[columnIndex] = "asc";
    } else if (sortOrder[columnIndex] === "asc") {
        sortOrder[columnIndex] = "desc";
    } else {
        sortOrder[columnIndex] = "asc";  // Toggle back to ascending if already descending
    }

    rowsArray.sort((a, b) => {
        const cellA = a.getElementsByTagName("td")[columnIndex].textContent;
        const cellB = b.getElementsByTagName("td")[columnIndex].textContent;

        if (sortOrder[columnIndex] === "asc") {
            return cellA.localeCompare(cellB);
        } else {
            return cellB.localeCompare(cellA);
        }
    });

    // Clear existing rows
    tbody.innerHTML = "";

    // Append sorted rows
    rowsArray.forEach(row => tbody.appendChild(row));

    // Update the header to reflect the sort order
    const headers = table.getElementsByTagName("th");
    Array.from(headers).forEach((th, index) => {
        th.classList.remove('asc', 'desc');
        if (index === columnIndex) {
            th.classList.add(sortOrder[columnIndex]);
        }
    });
}