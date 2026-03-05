import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MenuPage.css";
import CategorySection from "../components/CategorySection";
import MasterCustomizer from "../components/Customizer";
import { useCart } from "../context/cartContext";

const MenuPage = () => {
  const { addToCart } = useCart();

  const [menuData, setMenuData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/menu");
        setMenuData(response.data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();
  }, []);

  const groupedMenu = menuData.reduce((acc, item) => {
    const categoryTitle = item.category?.title || "Other";

    if (!acc[categoryTitle]) {
      acc[categoryTitle] = [];
    }

    acc[categoryTitle].push({
      _id: item._id, // ✅ KEEP ORIGINAL ID
      name: item.name,
      price: item.price,
      desc: item.desc,
      img: item.img,
    });

    return acc;
  }, {});

  const handleItemClick = async (item, categoryTitle) => {
    const customizableCategories = [
      "Signature Burgers",
      "Sides & Fries",
      "Momos",
    ];

    if (customizableCategories.includes(categoryTitle)) {
      setSelectedItem(item);
      setSelectedCategory(categoryTitle);
    } else {
      await addToCart(item);
    }
  };

  const handleConfirmCustomization = async (
    baseItem,
    selectedExtras,
    finalPrice
  ) => {
    const customizedItem = {
      ...baseItem,
      _id: baseItem._id, // ✅ Important
      price: finalPrice,
      customization: selectedExtras.map((e) => e.name).join(", "),
    };

    await addToCart(customizedItem);

    setSelectedItem(null);
    setSelectedCategory("");
  };

  return (
    <div className="menu-page">
      <div className="container">
        <div className="menu-header text-center">
          <h1>OUR FULL MENU</h1>
          <p>Fresh Ingredients. Flame Grilled. Made to Order.</p>
        </div>

        {Object.keys(groupedMenu).map((categoryTitle) => (
          <CategorySection
            key={categoryTitle}
            category={{
              title: categoryTitle,
              items: groupedMenu[categoryTitle],
            }}
            onItemClick={(item) =>
              handleItemClick(item, categoryTitle)
            }
          />
        ))}

        {selectedItem && (
          <MasterCustomizer
            item={selectedItem}
            category={selectedCategory}
            onClose={() => {
              setSelectedItem(null);
              setSelectedCategory("");
            }}
            onConfirm={handleConfirmCustomization}
          />
        )}
      </div>
    </div>
  );
};

export default MenuPage;