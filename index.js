const myMap = {
  coordinates: [],
  businesses: [],
  map: {},
  markers: [],

  buildMap() {
    this.map = L.map("map", {
      center: this.coordinates,
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 8,
    }).addTo(this.map);

    const marker = L.marker(this.coordinates);
    marker
      .addTo(this.map)
      .bindPopup("<p1><b>Hello, You are right here!</b><br></p1>")
      .openPopup();
  },
  // add business markers
  addMarkers() {
    this.markers = [];
    for (var i = 0; i < this.businesses.length; i++) {
      this.markers = L.marker([this.businesses[i].lat, this.businesses[i].long])
        .bindPopup(`<p1>${this.businesses[i].name}</p1>`)
        .addTo(this.map);
      //push each marker to the markers array
      this.markers.push(marker);
    }
  },
};
// get coordinates via geolocation api
async function getCoords() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  return [Math.floor(pos.coords.latitude), Math.floor(pos.coords.longitude)];
}
// get foursquare businesses
async function getFoursquare(business) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "fsq39nJkgK5siDaOrBajgtDkHuABZwU9Z2u2y5FfidMDeEQ=",
    },
  };
  let limit = 5;
  let lat = myMap.coordinates[0];
  let lon = myMap.coordinates[1];
  let response = await fetch(
    `https://cors-anywhere.herokuapp.com/https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`,
    options
  );
  let data = await response.text();
  let parsedData = JSON.parse(data);
  let businesses = parsedData.results;
  return businesses;
}
// process foursquare array
function processBusinesses(data) {
  let businesses = data.map((element) => {
    let location = {
      name: element.name,
      lat: element.location.lat,
      long: element.location.lng,
    };
    return location;
  });
  return businesses;
}
// window load
window.onload = async () => {
  const coords = await getCoords();
  myMap.coordinates = coords;
  myMap.buildMap();
};
// business submit button
document.getElementById("submit").addEventListener("click", async (event) => {
  event.preventDefault();
  let business = document.getElementById("business").value;
  let data = await getFoursquare(business);
  myMap.businesses = processBusinesses(data);
  myMap.addMarkers();
});
