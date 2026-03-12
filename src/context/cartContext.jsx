import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3000/api/cart";

  /* ===================================
     AUTH HEADER
  =================================== */
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  /* ===================================
     FETCH CART
  =================================== */
  const fetchCart = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL, getAuthConfig());

      // Backend returns array directly
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(
        "Fetch Cart Error:",
        error.response?.data || error.message
      );
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===================================
     LOAD CART ON LOGIN
  =================================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCart();
    }
  }, []);

  /* ===================================
     ADD TO CART
  =================================== */
  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add items to your cart!");
        window.location.href = "/login";
        return;
      }

      if (!product?._id) {
        console.error("Product _id missing");
        return;
      }

      setLoading(true);

      await axios.post(
        `${API_URL}/add`,
        {
          menuItemId: product._id,  // ✅ Correct ID
          name: product.name,
          img: product.img,
          price: product.price,
          customization: product.customization || "",
        },
        getAuthConfig()
      );

      // Immediately refresh cart
      await fetchCart();

    } catch (error) {
      console.error(
        "Add To Cart Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================
     REMOVE / DECREASE ITEM
  =================================== */
  const removeFromCart = async (menuItemId, customization = "") => {
    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/remove`,
        { menuItemId, customization },
        getAuthConfig()
      );

      await fetchCart();

    } catch (error) {
      console.error(
        "Remove Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================
     CLEAR CART (Optional but useful)
  =================================== */
  const clearCart = async () => {
    try {
      setLoading(true);

      await axios.delete(`${API_URL}/clear`, getAuthConfig());

      setCartItems([]);
    } catch (error) {
      console.error(
        "Clear Cart Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===================================
     TOTALS
  =================================== */
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalPrice,
        totalItems,
        loading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);