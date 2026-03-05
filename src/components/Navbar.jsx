import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext";
import logo from "../assets/burger-logo.jpg";
import { useTheme } from "../context/themeContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { totalItems, setIsCartOpen } = useCart();

  // ✅ Direct token check (always up-to-date)
  const isLoggedIn = !!localStorage.getItem("token");

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setMobileOpen(false);
    navigate("/");
    window.location.reload(); // 🔥 force navbar refresh
  };

  return (
    <nav className="navbar">
      <div className="nav-left" onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" className="logo-img" />
        <h1 className="logo-text">
          <span className="flame">FLAME</span>
          <span className="burger">BURGER</span>
        </h1>
      </div>

      <div className="nav-right">
        <ul className={`nav-links ${mobileOpen ? "active" : ""}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/menu">Menu</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li>
            <Link to="/booking" className="book-btn">
              Book a Table
            </Link>
          </li>

          {/* ✅ AUTH SECTION */}
          {!isLoggedIn ? (
            <li>
              <Link to="/login">Login</Link>
            </li>
          ) : (
            <li>
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>
            </li>
          )};

          <li className="theme-toggle-li">
            <button className="theme-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </li>
        </ul>

        {totalItems > 0 && (
          <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
            🛒
            <span className="cart-count">{totalItems}</span>
          </div>
        )}

        <div
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;