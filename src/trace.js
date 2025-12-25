const apiKey = 'P1CQ1E3KBHJ5U4SG'; // Your ThingSpeak API key
        const channelId = '2816622'; // Your ThingSpeak channel ID
        let thingspeakLat = 0;
        let thingspeakLon = 0;
        let deviceLat = 0;
        let deviceLon = 0;

        // Initialize the map
        const map = L.map('map', {
            minZoom: 5,
            maxZoom: 20,
        }).setView([0, 0], 19);

        // Add ESRI satellite imagery tile layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri — Source: Esri',
            maxNativeZoom: 19,
        }).addTo(map);

        // Define marker icons
        const redMarkerIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [25, 41],
            iconAnchor: [12.5, 41],
            popupAnchor: [1, -34],
        });

        const blueMarkerIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12.5, 41],
            popupAnchor: [1, -34],
        });

        // Create markers
        const thingspeakMarker = L.marker([0, 0], { icon: redMarkerIcon }).addTo(map)
            .bindPopup('ThingSpeak Location');
        const deviceMarker = L.marker([0, 0], { icon: blueMarkerIcon }).addTo(map)
            .bindPopup('Your Device Location');

        // Create polyline
        let polyline = L.polyline([[0, 0], [0, 0]], { color: 'cyan', weight: 3 }).addTo(map);

        // Function to calculate distance between two points (in meters)
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Earth's radius in meters
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return Math.round(R * c); // Distance in meters, rounded
        }

        // Function to update ThingSpeak location
        function updateThingSpeakLocation() {
            fetch(`https://api.thingspeak.com/channels/${channelId}/fields/1/last.json?api_key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    thingspeakLat = parseFloat(data.field1);
                    fetch(`https://api.thingspeak.com/channels/${channelId}/fields/2/last.json?api_key=${apiKey}`)
                        .then(response => response.json())
                        .then(data => {
                            thingspeakLon = parseFloat(data.field2);

                            // Update ThingSpeak marker
                            thingspeakMarker.setLatLng([thingspeakLat, thingspeakLon]);

                            // Update coordinates display
                            document.getElementById('thingspeak-coordinates').innerText = 
                                `Tracked Device: Latitude: ${thingspeakLat}, Longitude: ${thingspeakLon}`;

                            // Update polyline and distance
                            updatePolylineAndDistance();
                        })
                        .catch(error => console.error("Error fetching longitude: ", error));
                })
                .catch(error => console.error("Error fetching latitude: ", error));
        }

        // Function to update device location
        function updateDeviceLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        deviceLat = position.coords.latitude;
                        deviceLon = position.coords.longitude;

                        // Update device marker
                        deviceMarker.setLatLng([deviceLat, deviceLon]);

                        // Update coordinates display
                        document.getElementById('device-coordinates').innerText = 
                            `Your device: Latitude: ${deviceLat}, Longitude: ${deviceLon}`;

                        // Center map on device location initially
                        map.setView([deviceLat, deviceLon], 18);

                        // Update polyline and distance
                        updatePolylineAndDistance();
                    },
                    error => {
                        console.error("Error getting device location: ", error);
                        document.getElementById('device-coordinates').innerText = 
                            `Device: Unable to retrieve location`;
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
                document.getElementById('device-coordinates').innerText = 
                    `Device: Geolocation not supported`;
            }
        }

        // Function to update polyline and distance
        function updatePolylineAndDistance() {
            // Update polyline coordinates
            polyline.setLatLngs([[thingspeakLat, thingspeakLon], [deviceLat, deviceLon]]);

            // Calculate and display distance
            const distance = calculateDistance(thingspeakLat, thingspeakLon, deviceLat, deviceLon);
            document.getElementById('distance').innerText = `Distance: ${distance} meters`;
        }

        // Initial updates
        updateThingSpeakLocation();
        updateDeviceLocation();

        // Periodic updates every 5 seconds
        setInterval(() => {
            updateThingSpeakLocation();
            updateDeviceLocation();
        }, 5000);