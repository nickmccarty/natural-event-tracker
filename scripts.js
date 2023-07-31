// Global variable for the map
let map;

// Function to render the event table with data
function renderEventTable(events) {
    const tableBody = document.getElementById('event-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing table rows

    // Display up to ten rows of event data
    const rowsToShow = Math.min(events.length, 10);
    for (let i = 0; i < rowsToShow; i++) {
        const { title, geometries } = events[i];
        const date = new Date(geometries[0].date).toDateString();

        // Create a new table row
        const newRow = document.createElement('tr');
        const titleCell = document.createElement('td');
        const dateCell = document.createElement('td');

        // Set the cell values
        titleCell.textContent = title;
        dateCell.textContent = date;

        // Append cells to the row and row to the table body
        newRow.appendChild(titleCell);
        newRow.appendChild(dateCell);
        tableBody.appendChild(newRow);
    }
}

// Function to handle user input and make the API call
async function handleUserInput() {
    const eventType = document.getElementById('event-type').value;
    const categoryID = mapEventTypeToCategoryID(eventType);

    if (categoryID !== null) {
        try {
            const API_ENDPOINT = `https://eonet.gsfc.nasa.gov/api/v2.1/categories/${categoryID}`;
            const response = await fetch(API_ENDPOINT);
            const data = await response.json();
            const eventCount = data.events.length;
            displayEventCount(eventType, eventCount); // Display the event count on the page with the selected category
            renderMapMarkers(data.events); // Render markers on the map using the latitude and longitude from the JSON data
            createLineGraph(data.events, eventType); // Create the line graph with event data and selected category

            // Render the event table with the first ten rows of event data
            renderEventTable(data.events);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } else {
        console.error('Invalid Event Type selected.');
    }
}

// Function to map Event Type to Category ID
function mapEventTypeToCategoryID(eventType) {
    // Define a mapping of Event Type to Category ID
    const eventTypeToCategoryID = {
        'Wildfires': 8,
        'Icebergs': 15,
        'Severe Storms': 10,
        'Volcanoes': 12,
        // Add other event types and corresponding category IDs as needed
    };
    // Return the corresponding Category ID, or null if not found
    return eventTypeToCategoryID[eventType] || null;
}

// Function to display the event count on the page with the selected category
function displayEventCount(category, count) {
    const eventCountElement = document.getElementById('event-count');
    eventCountElement.innerHTML = `<p>Number of ${category}: ${count}</p>`;
}

// Function to render markers on the map with date in the popup
function renderMapMarkers(events) {
    // Clear existing markers from the map
    if (map) {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }

    // Create markers for each event's latitude and longitude
    events.forEach(event => {
        const { geometries, title } = event;
        if (geometries && geometries.length > 0) {
            const lat = geometries[0].coordinates[1];
            const lon = geometries[0].coordinates[0];
            const date = new Date(geometries[0].date).toDateString();

            // Create a marker and bind a popup with the event title and date
            const marker = L.marker([lat, lon]);
            marker.bindPopup(`<b>${title}</b><hr>${date}`);

            // Add the marker to the map
            marker.addTo(map);
        }
    });
}

// Function to create and update the line graph using Plotly.js
function createLineGraph(events, selectedCategory) {
    // Group events by year and count the occurrences for each year
    const eventCountsByYear = events.reduce((acc, event) => {
        const year = new Date(event.geometries[0].date).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
    }, {});

    // Extract the years and event counts for the line graph
    const years = Object.keys(eventCountsByYear);
    const eventCounts = Object.values(eventCountsByYear);

    // Create a trace for the line graph
    const trace = {
        x: years,
        y: eventCounts,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${selectedCategory} Count`,
        marker: { color: 'steelblue' }
    };

    // Create the layout for the line graph
    const layout = {
        title: `${selectedCategory}, by Year`,
        xaxis: {
            title: 'Year',
            tickvals: years // Use only the years as tick values
        },
        yaxis: { title: `Count` }
    };

    // Plot the line graph
    Plotly.newPlot('line-chart', [trace], layout);
}

// Function to initialize the map and set up event listeners
function initMap() {
    map = L.map('map-container').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Event listener for the Submit button click
    document.getElementById('submit-btn').addEventListener('click', handleUserInput);

    // Call handleUserInput initially to show data for the default event type
    handleUserInput();
}

// Initialize the map when the document is ready
document.addEventListener('DOMContentLoaded', initMap);