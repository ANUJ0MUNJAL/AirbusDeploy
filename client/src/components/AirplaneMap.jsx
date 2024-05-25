import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import LatLon from 'geodesy/latlon-spherical.js';
import "./AirplaneMap.css";
import "leaflet/dist/leaflet.css";
// Function to fetch and parse CSV data
const fetchCSV = async () => {
  const response = await fetch('/data/airports.csv');
  const csvData = await response.text();
  return parseCSV(csvData);
};

const parseCSV = (csvData) => {
  const lines = csvData.split('\n');
  const airports = [];

  for (let i = 0; i < lines.length; i++) {
    const fields = lines[i].split(',');
    const latitude = parseFloat(fields[1]);
    const longitude = parseFloat(fields[2]);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      airports.push({ latitude, longitude });
    }
  }

  return airports;
};

// Function to calculate the distance between two coordinates using the Haversine formula
const haversineDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = coord1.latitude * Math.PI / 180;
  const lon1 = coord1.longitude * Math.PI / 180;
  const lat2 = coord2.latitude * Math.PI / 180;
  const lon2 = coord2.longitude * Math.PI / 180;

  const dlat = lat2 - lat1;
  let dlon = lon2 - lon1;

  // Adjust for the 180th meridian
  if (Math.abs(dlon) > Math.PI) {
    dlon = dlon > 0 ? -(2 * Math.PI - dlon) : (2 * Math.PI + dlon);
  }

  const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dlon / 2) * Math.sin(dlon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};

const blueIcon = new L.divIcon({
  html: '<i class="fa fa-map-marker" style="font-size:48px;color:blue"></i>',
  iconSize: [48, 48],
  className: 'custom-icon',
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

const redIcon = new L.divIcon({
  html: '<i class="fa fa-map-marker" style="font-size:48px;color:red"></i>',
  iconSize: [48, 48],
  className: 'custom-icon',
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

const greenIcon = new L.divIcon({
  html: '<i class="fa fa-map-marker" style="font-size:48px;color:green"></i>',
  iconSize: [48, 48],
  className: 'custom-icon',
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

// Function to calculate intermediate points along the great-circle path
const calculateGreatCirclePath = (start, end, numPoints = 100) => {
  const startPoint = new LatLon(start.latitude, start.longitude);
  const endPoint = new LatLon(end.latitude, end.longitude);

  const path = [];
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const intermediatePoint = startPoint.intermediatePointTo(endPoint, fraction);
    path.push([intermediatePoint.lat, intermediatePoint.lon]);
  }

  return path;
};

function AirplaneMap() {
  const [airplanePosition, setAirplanePosition] = useState({ latitude: 0, longitude: 0 });
  const [airportData, setAirportData] = useState([]);
  const [distance, setDistance] = useState(0);
  const location = useLocation();
  const [destination, setDestination] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    if (location.state && location.state.destination) {
      setDestination(location.state.destination);
    }
  }, [location]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAirplanePosition({ latitude, longitude });
        setDistance(haversineDistance({ latitude, longitude }, destination));
      },
      (error) => {
        console.error("Error getting current location:", error);
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [destination]);

  useEffect(() => {
    const loadData = async () => {
      const parsedAirports = await fetchCSV();
      setAirportData(parsedAirports);
    };
    loadData();
  }, []);

  // Function to get the 5 nearest airports
  const getNearestAirports = () => {
    if (!airplanePosition.latitude || !airplanePosition.longitude || airportData.length === 0) {
      return [];
    }

    const airportsWithDistance = airportData.map((airport) => ({
      ...airport,
      distance: haversineDistance(airplanePosition, airport),
    }));

    airportsWithDistance.sort((a, b) => a.distance - b.distance);

    return airportsWithDistance.slice(0, 5);
  };

  const nearestAirports = getNearestAirports();
  const greatCirclePath = calculateGreatCirclePath(airplanePosition, destination);

  return (
    <div className="map-container">
      <MapContainer center={[airplanePosition.latitude, airplanePosition.longitude]} zoom={2} scrollWheelZoom={true} style={{ height: "100vh", width: "100vw" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[airplanePosition.latitude, airplanePosition.longitude]}
          icon={blueIcon}
        >
          <Popup>Your Current Location</Popup>
        </Marker>
        <Marker
          position={[destination.latitude, destination.longitude]}
          icon={greenIcon} // Use green icon for destination
        >
          <Popup>Destination</Popup>
        </Marker>
        <Polyline
          positions={greatCirclePath}
          color="blue"
        />
        {nearestAirports.map((airport, index) => (
          <Marker
            key={index}
            position={[airport.latitude, airport.longitude]}
            icon={redIcon} // Use red icon for airports
          >
            <Popup>Airport</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="distance-info">
        Distance to destination: {distance.toFixed(2)} km
      </div>
    </div>
  );
}

export default AirplaneMap;