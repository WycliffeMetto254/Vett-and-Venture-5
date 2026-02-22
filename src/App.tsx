import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PitchDeck from "./pages/founder/PitchDeck";
import Projections from "./pages/founder/Projections";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pitchdeck" element={<PitchDeck />} />
        <Route path="/projections" element={<Projections />} />
      </Routes>
    </Router>
  );
}

export default App;
