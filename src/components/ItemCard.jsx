import React from "react";

const ItemCard = ({ item, onAddClick, categoryTitle, customizableCategories = [] }) => {
  const isCustomizable =
    customizableCategories.includes(categoryTitle);

  const handleClick = () => {
    if (!onAddClick) {
      console.error("onAddClick not provided");
      return;
    }

    onAddClick(item);
  };

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("data:")) return src;
    if (src.startsWith("/assets/") || src.startsWith("/uploads")) {
      return `http://localhost:3000${src}`;
    }
    return src;
  };

  return (
    <div className="menu-item-card h-100">
      <div className="item-image">
        <img src={resolveImg(item.img)} alt={item.name} />
      </div>

      <div className="item-details d-flex flex-column">
        <div className="item-header">
          <h3>{item.name}</h3>
          <span className="price">${item.price}</span>
        </div>

        <p className="item-desc">{item.desc}</p>

        <div className="mt-auto">
          <button
            type="button"
            className="add-btn w-100"
            onClick={handleClick}
          >
            {isCustomizable
              ? "Customize & Add"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;