import React from "react";
import ItemCard from "./ItemCard";

const CategorySection = ({ category, onItemClick, customizableCategories }) => {
  return (
    <section className="menu-section">
      <h2 className="category-title">{category.title}</h2>

      <div className="row g-4">
        {category.items.map((item) => (
          <div key={item._id} className="col-12 col-md-6 col-lg-4">
            <ItemCard
              item={item}
              categoryTitle={category.title}
              customizableCategories={customizableCategories}
              onAddClick={(clickedItem) =>
                onItemClick(clickedItem)
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;