import React from "react";
import "./AboutPage.css";
import { useNavigate } from "react-router-dom";
import Button from "../components/button";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page py-5">
      <div className="container">
        <div className="row align-items-center g-5">

          {/* TEXT SIDE */}
          <div className="col-lg-6">
            <div className="about-text-section">
              <h1>THE FLAME BURGER</h1>
              <p>
                At Flame Burger, we create burgers that are bold, juicy,
                and unforgettable.
              </p>
              <p>
                From handcrafted buns to signature sauces,
                everything is made fresh daily.
              </p>

              <Button
                text="Book a Table"
                onClick={() => navigate("/booking")}
              />
            </div>
          </div>

          {/* IMAGE SIDE */}
          <div className="col-lg-6 text-center">
            <div className="about-image-section">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
                alt="Delicious Burger"
                className="img-fluid"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;