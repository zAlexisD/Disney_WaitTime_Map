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

// 3. Function to display a sidebar containing statistics
let chart; // global chart instance

function showChart(ride) {
  const panel = document.getElementById("chartPanel");
  const title = document.getElementById("chartTitle");
  const ctx = document.getElementById("rideChart").getContext("2d");

  // Update panel title
  title.innerText = ride.Rides;

  // Extract hourly averages dynamically
  const hours = ["8h30","9h30","10h30","11h30","12h30","13h30","14h30","15h30","16h30","17h30","18h30","19h30","20h30","21h30","22h30"];
  const waitTimes = hours.map(h => ride["Avg" + h] || null);

  // Destroy old chart if it exists
  if (chart) chart.destroy();

  // Create new chart
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: hours,
      datasets: [{
        label: "Avg Wait Time (min)",
        data: waitTimes,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: false,    // <- force display all labels
            maxRotation: 45,    // <- tilt labels if too crowded
            minRotation: 45     // <- keep consistent rotation
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Minutes"
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // Show panel
  panel.classList.add("active");
}

// 4. Function to make a custim pin for markers
function createPinIcon(color = "red") {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 10.5 12.5 28.5 12.5 28.5S25 23 25 12.5C25 5.6 19.4 0 12.5 0z" 
            fill="${color}" stroke="black" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: "",   // remove default styles
    iconSize: [25, 41],
    iconAnchor: [12, 41] // anchor at bottom tip of pin
  });
}

// 5. Function to load data and update markers
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

        // Decide color based on wait time
        let color;
        if (avg < 20) {
          color = "green";
        } else if (avg < 50) {
          color = "orange";
        } else {
          color = "red";
        }

        const marker = L.marker([ride.Latitude, ride.Longitude], {
          icon: createPinIcon(color)
        }).addTo(map);

        // On click, show the chart in the side panel
        marker.on("click", () => showChart(ride));

        marker.bindPopup(
          `<b>${ride.Rides}</b><br>
          Average wait time: <b>${avg} min</b><br>
          Closing chance: <b>${cr}%</b>`
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

// Event to close chart
document.getElementById("closePanel").addEventListener("click", () => {
  document.getElementById("chartPanel").classList.remove("active");
});