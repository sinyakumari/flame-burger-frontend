import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">

        <div className="row gy-5">

          {/* LOGO SECTION */}
          <div className="col-md-6 col-lg-3 footer-section">
            <h2 className="footer-logo">
              FLAME<span>BURGER</span>
            </h2>
            <p className="footer-tagline">
              The art of flame-grilled perfection since 1998.
            </p>
          </div>

          {/* LOCATION */}
          <div className="col-md-6 col-lg-3 footer-section">
            <h3>LOCATION</h3>
            <p>123 Burger Avenue</p>
            <p>Foodie City, FC 45678</p>
            <p>Phone: (555) 123-4567</p>
          </div>

          {/* HOURS */}
          <div className="col-md-6 col-lg-3 footer-section">
            <h3>HOURS</h3>
            <p>Mon - Thu: 11am - 10pm</p>
            <p>Fri - Sat: 11am - 12am</p>
            <p>Sunday: 12pm - 9pm</p>
          </div>

          {/* SOCIAL */}
          <div className="col-md-6 col-lg-3 footer-section">
            <h3>FOLLOW US</h3>
            <div className="social-links">
              <span>Facebook</span>
              <span>Instagram</span>
              <span>Twitter</span>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 FLAME BURGER. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;