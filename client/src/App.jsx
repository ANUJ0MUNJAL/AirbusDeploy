import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/HomePage';
import AirplaneMap from './components/AirplaneMap';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<AirplaneMap />} />
      </Routes>
    </Router>
  );
}

export default App;