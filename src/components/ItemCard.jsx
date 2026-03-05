import React from "react";

const ItemCard = ({ item, onAddClick, categoryTitle }) => {
  const customizableCategories = [
    "Signature Burgers",
    "Sides & Fries",
    "Momos",
  ];

  const isCustomizable =
    customizableCategories.includes(categoryTitle);

  const handleClick = () => {
    if (!onAddClick) {
      console.error("onAddClick not provided");
      return;
    }

    onAddClick(item);
  };

  return (
    <div className="menu-item-card h-100">
      <div className="item-image">
        <img src={item.img} alt={item.name} />
      </div>

      <div className="item-details d-flex flex-column">
        <div className="item-header">
          <h3>{item.name}</h3>
          <span className="price">${item.price}</span>
        </div>

        <p className="item-desc">{item.desc}</p>

        <button
          type="button"
          className="add-btn mt-auto"
          onClick={handleClick}
        >
          {isCustomizable
            ? "Customize & Add"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;