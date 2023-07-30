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
        'Earthquakes': 15,
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

// Event listener for the Submit button click
document.getElementById('submit-btn').addEventListener('click', handleUserInput);

// Define a global variable for the map
let map;

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

            // Render markers on the map using the latitude and longitude from the JSON data
            renderMapMarkers(data.events);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } else {
        console.error('Invalid Event Type selected.');
    }
}

// Function to render markers on the map
function renderMapMarkers(events) {
    // Clear existing markers, if any
    if (map) {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    }

    // Create markers for each event's latitude and longitude
    events.forEach(event => {
        const { geometries } = event;
        if (geometries && geometries.length > 0) {
            const lat = geometries[0].coordinates[1];
            const lon = geometries[0].coordinates[0];
            L.marker([lat, lon]).addTo(map);
        }
    });
}

// Function to initialize the map
function initMap() {
    map = L.map('map-container').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

// Event listener for the Submit button click
document.getElementById('submit-btn').addEventListener('click', handleUserInput);

// Initialize the map when the document is ready
document.addEventListener('DOMContentLoaded', initMap);
