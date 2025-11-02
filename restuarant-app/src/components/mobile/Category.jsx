import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/category.css";

const categoriesData = [
  { id: "burgers", name: "Burgers", icon: "🍔", path: "/category/Burgers" },
  { id: "pizza", name: "Pizza", icon: "🍕", path: "/category/Pizza" },
  { id: "drinks", name: "Drinks", icon: "🥤", path: "/category/Drinks" },
  { id: "fries", name: "Fries", icon: "🍟", path: "/category/Fries" },
  { id: "veggies", name: "Veggies", icon: "🥗", path: "/category/Veggies" },
  { id: "desserts", name: "Desserts", icon: "🍦", path: "/category/Desserts" },
  { id: "sushi", name: "Sushi", icon: "🍣", path: "/category/Sushi" },
];

const Category = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentCategory = location.pathname.split("/")[5];
    if (currentCategory) setActiveCategory(currentCategory.toLowerCase());
  }, [location]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category.id);
    navigate(`/category?${category.name}`);

  };

  return (
    <div className="category-scroll-container">
      <div className="food-categories-container">
        {categoriesData.map((category) => (
          <div
            key={category.id}
            className={`category-button ${
              activeCategory === category.id ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="icon-placeholder">{category.icon}</div>
            <p>{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
