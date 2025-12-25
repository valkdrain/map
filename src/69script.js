const apiKey = 'P1CQ1E3KBHJ5U4SG';
const channelId = '2816622';
let latitude;
let longitude;
// Initialize the map
const map = L.map('map', {
  minZoom: 5, // Set minimum zoom level
  maxZoom: 20, // Set maximum zoom level
}).setView([0, 0],19); // Set initial view

// Add ESRI satellite imagery tile layer
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
  maxNativeZoom: 19, // Set maximum native zoom level
}).addTo(map);

const redMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], // Original size of the marker image
  iconAnchor: [12.5, 41], // Adjusted anchor point
  popupAnchor: [1, -34], // Adjusted popup anchor point
});

        // Create a marker for the user's location with the custom icon
        const marker = L.marker([0, 0], { icon: redMarkerIcon }).addTo(map);

        // Define the polygon coordinates (covering MIT, MU campus)
        const polygonCoords = [
            [24.754722, 93.926744],
            [24.754734, 93.926655],
            [24.755049, 93.926743],
            [24.755088, 93.926447],  
            [24.754806, 93.926401],
            [24.755137, 93.926239],
            [24.755040, 93.925948],
            [24.754731, 93.926083],
            [24.754508, 93.925886],
            [24.754340, 93.926095],
            [24.754326, 93.926325],
            [24.754270, 93.926603],
            [24.754574, 93.926642],
            [24.754583, 93.926733]
        ];

        // Create a polygon on the map (GEOFENCING)
        const polygon = L.polygon(polygonCoords, { color: 'yellow', fillOpacity: 0, weight: 2 }).addTo(map);

        // Function to check if the point is inside the polygon
        function isInsidePolygon(lat, lon) {
            const point = [lat, lon];
            return polygon.getBounds().contains(point) && polygon.contains(point);
        }

        // Function to update the map with data from ThingSpeak
        function updateMap() {
            fetch(`https://api.thingspeak.com/channels/${channelId}/fields/1/last.json?api_key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    latitude = parseFloat(data.field1);
                    // Fetch longitude value from field 2
                    fetch(`https://api.thingspeak.com/channels/${channelId}/fields/2/last.json?api_key=${apiKey}`)
                        .then(response => response.json())
                        .then(data => {
                            longitude = parseFloat(data.field2);

                            // Update marker position
                            marker.setLatLng([latitude, longitude]);

                            // Center the map on the new location
                            map.setView([latitude, longitude], 18); // Set zoom level to 18

                            // Update coordinates display
                            document.getElementById('coordinates').innerText = `Latitude: ${latitude}
Longitude: ${longitude}`;

                            // Check if the current position is inside the polygon
                            if (!isInsidePolygon(latitude, longitude)) {
                                document.getElementById('myModal').style.display = "block"; // Show custom modal
                            }
                        })
                        .catch(error => console.error("Error fetching longitude: ", error));
                })
                .catch(error => console.error("Error fetching latitude: ", error));
        }

        // Call updateMap function to fetch data initially
        updateMap();

        // Optionally, you can set an interval to update the map periodically
        setInterval(updateMap, 5000); // Update every 5 seconds

        // Modal close functionality
        const modal = document.getElementById('myModal');
        const span = document.getElementsByClassName("close")[0];

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }