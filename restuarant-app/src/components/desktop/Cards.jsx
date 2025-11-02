import React, { useEffect, useState } from "react";
import axios from "axios";

import { PiBowlFoodBold } from "react-icons/pi";
import { FaRupeeSign } from "react-icons/fa";
import { PiBagFill, PiUsersThreeBold } from "react-icons/pi";

// 🟢 KPI Card
const KpiCard = ({ icon: IconComponent, value, label, iconBg, iconColor }) => (
  <div style={{ marginLeft: "25px", marginRight: "10px" }}>
    <div
      style={{
        width: "230px",
        height: "70px",
        padding: "15px",
        display: "flex",
        flexDirection: "row",
        borderRadius: "12px",
        backgroundColor: "#F0F5F3",
        border: "2px solid #D9D9D9",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "5%",
      }}
    >
      <div
        style={{
          backgroundColor: iconBg,
          padding: "10px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "60px",
          height: "45px",
          flexShrink: 0,
          marginRight: "15px",
          color: iconColor,
        }}
      >
        <IconComponent size={24} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          textAlign: "left",
          justifyContent: "center",
        }}
      >
        <h3
          style={{
            fontWeight: "bold",
            fontSize: "24px",
            margin: 0,
            color: "#626262",
          }}
        >
          {value}
        </h3>
        <h4
          style={{
            fontSize: "12px",
            color: "#626262",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </h4>
      </div>
    </div>
  </div>
);

// 🟢 Main Cards Component
export const Cards = ({ filterText = "" }) => {
  const [count, setCount] = useState(0);
  const [order,setOrder]=useState(0);
  const [revenue,setRevenue]=useState(0);
  const [kpiData, setKpiData] = useState([
    { label: "TOTAL CHEF", value: "04", icon: PiBowlFoodBold, iconBg: "#E0EFFF", iconColor: "black" },
    { label: "TOTAL REVENUE", value: "00", icon: FaRupeeSign, iconBg: "#E0EFFF", iconColor: "black" },
    { label: "TOTAL ORDERS", value: "00", icon: PiBagFill, iconBg: "#E0EFFF", iconColor: "black" },
    { label: "TOTAL CLIENTS", value: "00", icon: PiUsersThreeBold, iconBg: "#E0EFFF", iconColor: "black" },
  ]);

  const lowerCaseFilter = filterText.toLowerCase();

  const isMatch = (label, value) =>
    label.toLowerCase().includes(lowerCaseFilter) ||
    value.toString().toLowerCase().includes(lowerCaseFilter);

  // 🟢 Fetch total clients from backend
  useEffect(() => {
    const fetchTotalClients = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/user/count/unique");
        const totalClients = res.data.uniqueUserCount;

        // ✅ Add leading zero if less than 10
        const formattedCount = String(totalClients).padStart(2, "0");

        setCount(formattedCount);

        // ✅ Update KPI data dynamically
        setKpiData((prevData) =>
          prevData.map((item) =>
            item.label === "TOTAL CLIENTS"
              ? { ...item, value: formattedCount }
              : item
          )
        );
      } catch (err) {
        console.error("Error fetching total clients:", err);
      }
    };

    fetchTotalClients();
  }, []);

useEffect(() => {
  const fetchTotalOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/order/count");
      console.log("Order-count API response:", res.data);

      const totalOrder = res.data.totalOrders;  // use this property

      const formattedCount = String(totalOrder || 0).padStart(2, "0");
      setOrder(formattedCount);

      setKpiData(prevData =>
        prevData.map(item =>
          item.label === "TOTAL ORDERS"
            ? { ...item, value: formattedCount }
            : item
        )
      );
    } catch (err) {
      console.error("Error fetching total orders:", err);
    }
  };

  fetchTotalOrders();
}, []);



useEffect(() => {
  const fetchTotalRevenue = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/order/revenue");
      console.log("Order-count API response:", res.data);

      const totalRevenue = res.data.totalRevenue;  // use this property

      const formattedCount = String(totalRevenue || 0).padStart(2, "0");
      setOrder(formattedCount);

      setKpiData(prevData =>
        prevData.map(item =>
          item.label === "TOTAL REVENUE"
            ? { ...item, value: formattedCount }
            : item
        )
      );
    } catch (err) {
      console.error("Error fetching total orders:", err);
    }
  };

  fetchTotalRevenue();
}, []);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        marginBottom: "30px",
        padding: "0 30px",
      }}
    >
      {kpiData.map((item) => (
        <div
          key={item.label}
          style={{
            filter: isMatch(item.label, item.value) ? "none" : "blur(3px)",
            opacity: isMatch(item.label, item.value) ? 1 : 0.4,
            transition: "all 0.3s ease",
          }}
        >
          <KpiCard {...item} />
        </div>
      ))}
    </div>
  );
};
