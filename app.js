// 1. Initialize the map centered on Disneyland Paris
var map = L.map('map').setView([48.872234, 2.775808], 16); 
// Coords = Disneyland Paris, zoom = 16

// 2. Add a basemap (tiles from OpenStreetMap)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let markers = []; // to store current markers

// 2. Function to clear old markers
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// 3. Function to load data and update markers
function loadData(dayFile, hourChoice) {
  fetch(dayFile)
    .then(res => res.json())
    .then(data => {
      clearMarkers();

      data.forEach(ride => {
        let avg, cr;

        if (hourChoice === "Overall") {
          avg = ride["AvgTime"];
          cr = ride["Closing rate"];
        } else {
          avg = ride["Avg" + hourChoice];
          cr = ride["CR" + hourChoice];
        }

        var marker = L.marker([ride.Latitude, ride.Longitude]).addTo(map);
        marker.bindPopup(
          `<b>${ride.Rides}</b><br>
           Avg wait: ${avg} min<br>
           Chance of closure: ${cr}%`
        );

        markers.push(marker);
      });
    });
}

// 4. Dropdown event listeners
var daySelect = document.getElementById("daySelect");
var hourSelect = document.getElementById("hourSelect");

function updateMap() {
  var dayFile = daySelect.value;
  var hourChoice = hourSelect.value;
  loadData(dayFile, hourChoice);
}

daySelect.addEventListener("change", updateMap);
hourSelect.addEventListener("change", updateMap);

// 5. Initial load (Overall stats, Overall averages)
loadData("Overall.json", "Overall");