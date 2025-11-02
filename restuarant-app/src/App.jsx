import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Desktop components
import Home from "./pages/desktop/Home";
import Dashboard from "./pages/desktop/Dashboard";
import AddTables from "./pages/desktop/AddTables";
import Mobilehome from "./pages/Mobile/Mobilehome";
import Product from "./pages/desktop/Product";
import CategoryProduct from "./pages/Mobile/CategoryProduct";
import Category from "./components/mobile/Category";
import ThankYouPage from './pages/Mobile/ThankYouPage'
import OrderPage from "./pages/Mobile/OrderPage";
import Orderline from "./pages/desktop/Orderline";

// Mobile components


function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(detectMobile());
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile ? (
        // Mobile routes only
        <Routes>
           <Route path="/" element={<Mobilehome/>}></Route>
            {/* ✅ Route for category list */}
        <Route path="/category" element={<Category/>} />
          <Route path="/order-page" element={<OrderPage/>} />

        {/* ✅ Route for products by category */}
        <Route path="/category/:category" element={<CategoryProduct />} />
                   <Route path="/thank-you" element={<ThankYouPage />} />

          {/* Add more mobile pages here */}
        </Routes>
      ) : (
        // Desktop routes only
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Dashboard />} />
            <Route path="tables" element={<AddTables />} />
             <Route path="products" element={<Product/>} />
              <Route path="order" element={<Orderline/>} />
          </Route>
        </Routes>
      )}
    </>
  );
}

// Detect normal mobile devices
const detectMobile = () => {
  const width = window.innerWidth;
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // Any mobile device by user agent OR small screen
  return /iPhone|iPad|iPod|Android/i.test(ua) || width <= 428 && height <=926;
};

export default App;
