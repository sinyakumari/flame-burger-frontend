import React from "react";
import { useNavigate } from "react-router-dom";
import "./hero.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <header className="hero">

      <div className="hero-overlay"></div>

      <div className="hero-content container text-center">

        <div className="hero-text-box">

          <span className="welcome-tag">
            WELCOME TO THE
          </span>

          <h1 className="main-title">
            FLAME BURGER
          </h1>

          <div className="line-accent">
            <div className="red-line"></div>
            <p className="tagline">Gourmet Sports Bar</p>
            <div className="red-line"></div>
          </div>

        </div>

        <div className="hero-btns d-flex flex-column flex-md-row justify-content-center gap-3">

          <button
            className="btn-fill"
            onClick={() => navigate("/booking")}
          >
            Make A Reservation
          </button>

          <button
            className="btn-line"
            onClick={() => navigate("/menu")}
          >
            View The Menu
          </button>

        </div>

      </div>
    </header>
  );
};

export default Hero;