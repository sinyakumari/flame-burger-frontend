import React, { useState, useEffect } from "react";
import "./Customizer.css";

const MasterCustomizer = ({ item, category, onClose, onConfirm }) => {
  const [extras, setExtras] = useState([]);
  const [toppingOptions, setToppingOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reset extras when new item opens
  useEffect(() => {
    setExtras([]);
  }, [item]);

  // Fetch customizations from backend
  useEffect(() => {
    if (!category) return;

    setLoading(true);

    fetch(`http://localhost:3000/api/customization/${category}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch customizations");
        }
        return res.json();
      })
      .then((data) => {
        // Only show active options
        const activeOptions = data.filter(opt => opt.isActive !== false);
        setToppingOptions(activeOptions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Customization fetch error:", err);
        setToppingOptions([]);
        setLoading(false);
      });

  }, [category]);

  const handleToggleExtra = (extra) => {
    setExtras((prev) =>
      prev.find((e) => e._id === extra._id)
        ? prev.filter((e) => e._id !== extra._id)
        : [...prev, extra]
    );
  };

  const totalPrice =
    item.price + extras.reduce((sum, e) => sum + e.price, 0);

  return (
    <div className="master-modal-overlay">
      <div className="master-modal-content">
        <div className="modal-header">
          <h3>Customize {item.name}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#aaa", marginTop: "15px" }}>
            Loading customizations...
          </p>
        ) : toppingOptions.length > 0 ? (
          <div className="extras-grid">
            {toppingOptions.map((extra) => (
              <label key={extra._id} className="extra-item">
                <div className="extra-info">
                  <input
                    type="checkbox"
                    onChange={() => handleToggleExtra(extra)}
                    checked={extras.some((e) => e._id === extra._id)}
                  />
                  <span>{extra.name}</span>
                </div>
                <span className="extra-price">
                  +${extra.price.toFixed(2)}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p style={{ color: "#aaa", marginTop: "15px" }}>
            No customization available for this category.
          </p>
        )}

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="confirm-btn"
            onClick={() => onConfirm(item, extras, totalPrice)}
          >
            ADD TO CART | ${totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterCustomizer;