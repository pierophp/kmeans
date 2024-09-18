const { kmeans } = require("ml-kmeans");
const { writeFile } = require("fs").promises;

// Function to convert lat/lon to Cartesian coordinates
function latLonToCartesian(lat, lon) {
  const R = 6371; // Earth's radius in kilometers
  const latRad = (lat * Math.PI) / 180; // Convert to radians
  const lonRad = (lon * Math.PI) / 180;

  const x = R * Math.cos(latRad) * Math.cos(lonRad);
  const y = R * Math.cos(latRad) * Math.sin(lonRad);
  const z = R * Math.sin(latRad);

  return [x, y, z];
}

// Example data: array of [latitude, longitude]

// Example data with names and coordinates
// const data = [
//   {
//     name: "San Francisco",
//     coordinates: [37.7749, -122.4194],
//   },
//   {
//     name: "Los Angeles",
//     coordinates: [34.0522, -118.2437],
//   },
//   {
//     name: "New York City",
//     coordinates: [40.7128, -74.006],
//   },
//   {
//     name: "London",
//     coordinates: [51.5074, -0.1278],
//   },
//   {
//     name: "Paris",
//     coordinates: [48.8566, 2.3522],
//   },
// ];

// Function to generate random latitude and longitude within São Paulo
function getRandomCoordinatesInSaoPaulo() {
  const minLat = -23.7;
  const maxLat = -23.4;
  const minLon = -46.7;
  const maxLon = -46.3;

  const latitude = Math.random() * (maxLat - minLat) + minLat;
  const longitude = Math.random() * (maxLon - minLon) + minLon;

  return [latitude, longitude];
}

// Generate 500 random points within São Paulo
const data = [];
for (let i = 0; i < 500; i++) {
  const coordinates = getRandomCoordinatesInSaoPaulo();
  const name = `Address ${i + 1}`;

  data.push({
    name: name,
    coordinates: coordinates,
  });
}

// Output the data (you can replace this with file writing or other logic)
// console.log(data);

// Convert lat/lon to Cartesian coordinates
const cartesianData = data.map(({ coordinates }) =>
  latLonToCartesian(...coordinates)
);

// Perform k-means clustering (3 clusters in this case)
const numberOfClusters = 5;
const clusters = kmeans(cartesianData, numberOfClusters);

function cartesianToLatLon(x, y, z) {
  const R = 6371; // Earth's radius in kilometers
  const lat = (Math.asin(z / R) * 180) / Math.PI; // Convert radians to degrees
  const lon = (Math.atan2(y, x) * 180) / Math.PI;

  return [lat, lon];
}

// Map the cluster indices to the place names
const placesByCluster = clusters.clusters.reduce((acc, clusterIndex, i) => {
  if (!acc[clusterIndex]) {
    acc[clusterIndex] = [];
  }
  acc[clusterIndex].push(data[i]);
  return acc;
}, {});

// Output the clusters with place names
// Object.keys(placesByCluster).forEach((clusterIndex) => {
//   console.log(
//     `Cluster ${clusterIndex}: ${placesByCluster[clusterIndex].join(", ")}`
//   );
// });

async function run() {
  await writeFile(
    "../vite-open-street-map/src/locations.ts",
    "export default " +
      JSON.stringify(
        {
          clusters: Object.values(placesByCluster),
          centroids: clusters.centroids.map((centroid) =>
            cartesianToLatLon(...centroid)
          ),
        },
        null,
        2
      )
  );
}

// console.log(clusters);

run();
// console.log(JSON.stringify(placesByCluster, null, 2));

// 3. Visualize Clusters on a Map (Optional)

// const clusteredLatLon = clusters.centroids.map((centroid) =>
//   cartesianToLatLon(...centroid)
// );
// console.log(clusteredLatLon);
