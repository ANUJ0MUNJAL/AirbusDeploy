import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/HomePage';
import AirplaneMap from './components/AirplaneMap';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<AirplaneMap />} />
      </Routes>
    </Router>
  );
}

export default App;
