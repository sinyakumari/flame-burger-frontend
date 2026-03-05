import React from "react";
import "./ourStory.css";

const OurStory = () => {
  return (
    <section className="ourstory-section py-5">
      <div className="container">
        <div className="row align-items-center g-5">

          {/* TEXT SIDE */}
          <div className="col-lg-5">
            <div className="ourstory-text">
              <h2>OUR STORY</h2>
              <p>
                We believe in quality ingredients and the power of fire.
                Our burgers are grilled over open flames to capture
                that authentic smoky flavor you crave.
              </p>
            </div>
          </div>

          {/* IMAGE SIDE */}
          <div className="col-lg-7 text-center">
            <div className="ourstory-image">
              <img
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800"
                alt="Burger Story"
                className="img-fluid"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OurStory;