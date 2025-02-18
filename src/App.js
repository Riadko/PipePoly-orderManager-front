import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PendingOrders from "./pages/Home";
import Validated from "./pages/Validated";
import Finished from "./pages/Finished";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <div>
        <nav>
          {/* Logo */}
          <img
            src={`${process.env.PUBLIC_URL}/logoBlack.png`}
            alt="Logo"
            className={`logo ${menuOpen ? "hidden" : "center-logo"}`} 
          />

          {/* Hamburger Menu Button */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <i className="fas fa-bars"></i>
          </button>

          {/* Navigation Links */}
          <ul className={menuOpen ? "nav-links open" : "nav-links"}>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Pending Orders</Link></li>
            <li><Link to="/validated" onClick={() => setMenuOpen(false)}>Validated Orders</Link></li>
            <li><Link to="/finished" onClick={() => setMenuOpen(false)}>Finished Orders</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<PendingOrders />} />
          <Route path="/validated" element={<Validated />} />
          <Route path="/finished" element={<Finished />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;