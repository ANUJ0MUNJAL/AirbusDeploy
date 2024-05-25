import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./HomePage.css";

const fetchCSV = async () => {
  const response = await fetch('/data/airports.csv');
  const csvData = await response.text();
  return parseCSV(csvData);
};

const parseCSV = (csvData) => {
  const lines = csvData.split('\n');
  const airports = [];

  for (let i = 35000; i < 36000; i++) {
    const fields = lines[i].split(',');
    const name = fields[0]; // Assuming the airport name is in the third column
    const latitude = parseFloat(fields[1]);
    const longitude = parseFloat(fields[2]);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      airports.push({ name, latitude, longitude });
    }
  }

  return airports;
};

function Home() {
  const [airportData, setAirportData] = useState([]);
  
  const [selectedDestination, setSelectedDestination] = useState({ latitude: 0, longitude: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const parsedAirports = await fetchCSV();
      setAirportData(parsedAirports);
    };
    loadData();
  }, []);

  const handleSubmit = () => {
    if (selectedDestination.latitude !== 0 && selectedDestination.longitude !== 0) {
        console.log(selectedDestination.latitude);
      navigate('/map', { state: { destination: selectedDestination } });
    }
  };

  return (
    <div className="home-container">
      <div className="container-inner">
        <h1>Select Destination</h1>
        <select onChange={(e) => {
          const selectedAirport = JSON.parse(e.target.value);
          setSelectedDestination({
            latitude: selectedAirport.latitude,
            longitude: selectedAirport.longitude
          });
        }}>
          <option value="">Select an airport</option>
          {airportData.map((airport, index) => (
            <option key={index} value={JSON.stringify({ latitude: airport.latitude, longitude: airport.longitude })}>
              {airport.name}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit}>Show Map</button>
      </div>
    </div>
  );
}

export default Home;
