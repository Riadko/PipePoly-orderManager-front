import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PendingOrders from "./pages/Home";
import Validated from "./pages/Validated";
import Finished from "./pages/Finished";
import "@fortawesome/fontawesome-free/css/all.min.css";

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Pending Orders</Link></li>
            <li><Link to="/validated">Validated Orders</Link></li>
            <li><Link to="/finished">Finished Orders</Link></li>
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
