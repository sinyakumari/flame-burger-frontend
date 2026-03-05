import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext";
import axios from "axios";
import "./orderSummaryPage.css";

const OrderSummaryPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, fetchCart } = useCart();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    payment: "cash",
  });

  /* ===============================
     VERIFY ACCESS + FETCH CART
  =============================== */
  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/404");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/checkout",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setAuthorized(true);
          await fetchCart(); // always refresh cart
        }
      } catch (error) {
        console.error("Access Error:", error.response?.data);
        navigate("/404");
      }
    };

    verifyAccess();
  }, [navigate, fetchCart]);

  if (!authorized) return null;

  /* ===============================
     FORM CHANGE
  =============================== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ===============================
     PLACE ORDER
  =============================== */
  const handleOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:3000/api/orders/place",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || "🎉 Order Placed Successfully!");

      await fetchCart(); // cart should now be empty
      navigate("/");

    } catch (error) {
      console.error("Order Error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2 className="checkout-title">🧾 Order Summary</h2>

        <div className="order-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty 😢</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id + (item.customization || "")}
                className="order-item"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="order-img"
                />

                <div className="order-info">
                  <h5>{item.name}</h5>

                  {item.customization && (
                    <p className="custom-text">
                      {item.customization}
                    </p>
                  )}

                  <p>Qty : {item.quantity}</p>
                </div>

                <div className="order-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="price-summary">
          <div className="price-row">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <div className="price-row">
            <span>Delivery</span>
            <span>$5.00</span>
          </div>

          <div className="price-total">
            <span>Total</span>
            <span>${(totalPrice + 5).toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleOrder} className="checkout-form">
          <input
            className="form-control"
            name="name"
            placeholder="Enter Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <textarea
            className="form-control"
            name="address"
            placeholder="Enter Delivery Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <select
            className="form-control"
            name="payment"
            value={formData.payment}
            onChange={handleChange}
          >
            <option value="cash">Cash on Delivery</option>
            <option value="card">Card Payment</option>
            <option value="upi">UPI</option>
          </select>

          <button
            className="checkout-btn"
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderSummaryPage;