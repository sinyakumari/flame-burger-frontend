import React from "react";
import { useCart } from "../context/cartContext";
import { useNavigate } from "react-router-dom";
import "./cartDrawer.css";

const CartDrawer = () => {
  const navigate = useNavigate();

  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    addToCart,
    removeFromCart,
    totalPrice,
    totalItems
  } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const token = localStorage.getItem("token");

    setIsCartOpen(false);

    if (!token) {
      navigate("/login", { state: { fromCheckout: true } });
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isCartOpen ? "active" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Panel */}
      <div className={`cart-panel ${isCartOpen ? "open" : ""}`}>
        <div className="cart-content">

          {/* Header */}
          <div className="cart-header">
            <h2>My Cart ({totalItems})</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="close-btn"
            >
              &times;
            </button>
          </div>

          {/* Items */}
          <div className="cart-items-list">
            {cartItems.length === 0 ? (
              <p className="empty-msg">
                Your cart is empty 🔥
              </p>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="cart-item">

                  {/* Image */}
                  <div className="cart-item-left">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="cart-item-img"
                    />
                  </div>

                  {/* Info */}
                  <div className="cart-item-info">
                    <h4 className="item-name">{item.name}</h4>

                    {item.customization && (
                      <p className="item-customization">
                        + {item.customization}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="quantity-controller">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          removeFromCart(item.menuItem, item.customization)
                        }
                      >
                        −
                      </button>

                      <span className="qty-number">
                        {item.quantity}
                      </span>

                      <button
                        className="qty-btn"
                        onClick={() =>
                          addToCart({
                            menuItemId: item.menuItem,
                            name: item.name,
                            img: item.img,
                            price: item.price,
                            customization: item.customization
                          })
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="cart-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="cart-footer">

            <div className="total-row">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {cartItems.length === 0 && (
              <p className="checkout-warning">
                ⚠ Add items to proceed to checkout
              </p>
            )}

            <button
              className="checkout-btn"
              disabled={cartItems.length === 0}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>

          </div>

        </div>
      </div>
    </>
  );
};

export default CartDrawer;