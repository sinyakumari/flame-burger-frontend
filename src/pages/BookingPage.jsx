import { useState } from "react";
import './BookingPage.css'

const BookingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    guests: "2",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Reservation Confirmed for ${formData.name}!\nDate: ${formData.date}\nTime: ${formData.time}`);
    // Future: Connect to a backend API here
  };

  return (
    <div className="booking-page">
      <div className="booking-overlay"></div>
      <div className="booking-content">
        <div className="booking-card">
          <h1 className="oswald-title">RESERVE YOUR TABLE</h1>
          <p className="booking-subtitle">Experience the flame-grilled magic in person.</p>
          
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="John Doe" 
                required 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="john@example.com" 
                required 
                onChange={handleChange} 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" required onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" name="time" required onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Number of Guests</label>
              <select name="guests" onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6, "7+"].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-fill booking-submit">
              CONFIRM BOOKING
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;