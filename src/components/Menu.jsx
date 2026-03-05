import React, { useState } from "react";
import "./Menu.css";
import { useCart } from "../context/cartContext";
import MasterCustomizer from "../components/Customizer";

const MenuPreview = () => {
  const { addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState(null);

  /* ===============================
     HOME PREVIEW STATIC DATA
  =============================== */
  const previewItems = [
    {
      id: "hb1",
      name: "Flame Classic Burger",
      price: 8.99,
      desc: "Juicy flame-grilled beef patty with lettuce, tomato & signature sauce.",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    },
    {
      id: "hb2",
      name: "Smoky BBQ Burger",
      price: 9.99,
      desc: "Loaded with crispy onions, cheddar cheese & smoky BBQ sauce.",
      img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500",
    },
    {
      id: "hb3",
      name: "Double Cheese Blast",
      price: 10.99,
      desc: "Double beef patties layered with melted cheese & special seasoning.",
      img: "https://images.unsplash.com/photo-1584178639036-613ba57e5e39?w=500",
    },
  ];

  /* ===============================
     CONFIRM CUSTOMIZATION
  =============================== */
  const handleConfirmCustomization = (baseItem, selectedExtras, finalPrice) => {
    const customizedItem = {
      ...baseItem,
      id: `${baseItem.id}-${Date.now()}`,
      price: finalPrice,
      customization: selectedExtras.map((e) => e.name).join(", "),
    };

    addToCart(customizedItem);
    setSelectedItem(null);
  };

  return (
    <section className="home-menu-section">
      <div className="container">
        <h2 className="text-center mb-5">CHOOSE YOUR FAVORITE</h2>

        <div className="row g-4 justify-content-center">
          {previewItems.map((item) => (
            <div
              key={item.id}
              className="col-12 col-sm-6 col-md-4"
            >
              <div className="home-menu-card h-100">
                <div className="home-menu-img-box">
                  <span className="home-price-tag">
                    ${item.price}
                  </span>
                  <img src={item.img} alt={item.name} />
                </div>

                <div className="home-menu-info d-flex flex-column">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>

                  <button
                    className="home-add-btn mt-auto"
                    onClick={() => setSelectedItem(item)}
                  >
                    CUSTOMIZE & ORDER
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <MasterCustomizer
          item={selectedItem}
          category="Signature Burgers"
          onClose={() => setSelectedItem(null)}
          onConfirm={handleConfirmCustomization}
        />
      )}
    </section>
  );
};

export default MenuPreview;