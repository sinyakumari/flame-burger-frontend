import React from "react";
import "./Contact.css";

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="container">

        <h1 className="contact-title text-center mb-5">
          CONTACT US
        </h1>

        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">

            <form className="contact-form">

              <input
                type="text"
                className="form-control custom-input"
                placeholder="Your Name"
              />

              <input
                type="email"
                className="form-control custom-input"
                placeholder="Your Email"
              />

              <textarea
                className="form-control custom-input"
                placeholder="Your Message"
              ></textarea>

              <button type="submit" className="contact-btn mt-2">
                Send Message
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;