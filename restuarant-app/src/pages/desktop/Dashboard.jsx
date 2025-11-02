import React, { useState, useEffect, useRef } from "react";
import OrderSummary from "../../components/desktop/OrderSummary";
import RevenueSummary from "../../components/desktop/RevenueSummary";
import Tables from "../../components/desktop/Tables";
import { Cards } from "../../components/desktop/Cards";
import "../../styles/dashboard.css";
import ChefOrders from "../../components/desktop/ChefOrders";


function Dashboard() {
  const [searchText, setSearchText] = useState("");

  const cardsRef = useRef(null);
  const orderSummaryRef = useRef(null);
  const revenueSummaryRef = useRef(null);
  const tablesRef = useRef(null);
  const chefOrdersRef = useRef(null);

  // ✅ Listen for custom search event from Navbar
  useEffect(() => {
    const handleSearch = (event) => {
      setSearchText(event.detail || "");
    };
    window.addEventListener("dashboard-search", handleSearch);
    return () => window.removeEventListener("dashboard-search", handleSearch);
  }, []);

  const query = searchText.trim().toLowerCase();

  // ✅ Partial letter-by-letter matching
  const matches = {
    cards:
      query === "" ||
      "total chef total orders total revenue total clients orders clients revenue".includes(query),
    orderSummary: query === "" || "order summary summary".includes(query),
    revenueSummary: query === "" || "revenue ".includes(query),
    tables: query === "" || "table tables".includes(query),
    //
  };

  // ✅ Auto-scroll on match (ChefOrders removed)
  useEffect(() => {
    if (!query) return;

    if (matches.revenueSummary)
      revenueSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (matches.orderSummary)
      orderSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (matches.tables)
      tablesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (matches.cards)
      cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [searchText]);

  // ✅ Reusable blur style
  const blurStyle = (isMatch) => ({
    filter: isMatch ? "none" : "blur(3px)",
    opacity: isMatch ? 1 : 0.4,
    transition: "all 0.3s ease",
  });

  return (
    <div className="body">
      <h1 style={{ color: "#626262", marginLeft: "50px", marginTop: "20px" }}>Analytics</h1>

      {/* KPI Cards */}
      <div ref={cardsRef} style={blurStyle(matches.cards)}>
        <Cards filterText={searchText} />
      </div>

      {/* Summary & Tables */}
      <div style={{ marginLeft: "5%", display: "flex" }}>
        <div ref={orderSummaryRef} style={blurStyle(matches.orderSummary)}>
          <OrderSummary />
        </div>
        <div
          ref={revenueSummaryRef}
          style={{ marginLeft: "17px", ...blurStyle(matches.revenueSummary) }}
        >
          <RevenueSummary />
        </div>
        <div ref={tablesRef} style={{ marginLeft: "17px", ...blurStyle(matches.tables) }}>
          <Tables />
        </div>
      </div>

      {/* ✅ Chef Orders (Always visible, no blur/filter) */}
      <div ref={chefOrdersRef} style={{ marginTop: "0px" }}>
        <ChefOrders />
      </div>
    </div>
  );
}

export default Dashboard;
