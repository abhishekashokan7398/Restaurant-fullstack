import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

function OrderSummary() {
  const [period, setPeriod] = useState("daily");
  const [dineIn, setDineIn] = useState(0);
  const [takeAway, setTakeAway] = useState(0);
  const [served, setServed] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("https://restaurant-fullstack-svjm.vercel.app/api/order/count/by-type");
        console.log("API response:", res.data);

        const dataForPeriod = res.data[period] || { dineIn: 0, takeAway: 0, served: 0 };

        // 🧮 Adjust Dine In so that served orders are removed from it
        const dineInRemaining = Math.max((dataForPeriod.dineIn || 0) - (dataForPeriod.served || 0), 0);

        setDineIn(dineInRemaining);
        setTakeAway(dataForPeriod.takeAway || 0);
        setServed(dataForPeriod.served || 0);
      } catch (err) {
        console.error("Error fetching order summary:", err);
      }
    };

    fetchSummary();
    // optional: auto-refresh every 10 seconds to stay live
    const interval = setInterval(fetchSummary, 10000);
    return () => clearInterval(interval);
  }, [period]);

  // ✅ Correct total and percentage logic
  const totalOrders = dineIn + takeAway + served;

  const percentTakeAway = totalOrders > 0 ? (takeAway / totalOrders) * 100 : 0;
  const percentDineIn = totalOrders > 0 ? (dineIn / totalOrders) * 100 : 0;
  const percentServed = totalOrders > 0 ? (served / totalOrders) * 100 : 0;

  const getPercent = (name) => {
    switch (name) {
      case "Take Away":
        return Math.round(percentTakeAway);
      case "Dine In":
        return Math.round(percentDineIn);
      case "Served":
        return Math.round(percentServed);
      default:
        return 0;
    }
  };

  const data = [
    { name: "Take Away", value: takeAway },
    { name: "Served", value: served },
    { name: "Dine In", value: dineIn },
  ];

  const COLORS = ["#A9A9A9", "#505050", "#808080"];

  return (
    <div
      style={{
        height: "302px",
        width: "400px",
        backgroundColor: "#F0F5F3",
        borderRadius: "8px",
        border: "2px solid #D9D9D9",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "370px",
          height: "70px",
          borderBottom: "2px solid #D9D9D9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 15px",
        }}
      >
        <h4
          style={{
            color: "#6E6E6E",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          Order Summary
        </h4>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            height: "35px",
            border: "2px solid #D9D9D9",
            color: "#6E6E6E",
            padding: "0 10px",
            borderRadius: "20px",
            backgroundColor: "white",
            outline: "none",
            marginRight: "30px",
          }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: "90px",
          textAlign: "center",
        }}
      >
        <div style={{ width: "80px", height: "60px", backgroundColor: "white" }}>
          <h3 style={{ color: "#505050", margin: 0 }}>
            {served.toString().padStart(2, "0")}
          </h3>
          <p style={{ color: "#6E6E6E", margin: 0, fontSize: "13px" }}>Served</p>
        </div>

        <div style={{ width: "80px", height: "60px", backgroundColor: "white" }}>
          <h3 style={{ color: "#505050", margin: 0 }}>
            {dineIn.toString().padStart(2, "0")}
          </h3>
          <p style={{ color: "#6E6E6E", margin: 0, fontSize: "13px" }}>Dine In</p>
        </div>

        <div style={{ width: "80px", height: "60px", backgroundColor: "white" }}>
          <h3 style={{ color: "#505050", margin: 0 }}>
            {takeAway.toString().padStart(2, "0")}
          </h3>
          <p style={{ color: "#6E6E6E", margin: 0, fontSize: "13px" }}>Take Away</p>
        </div>
      </div>

      {/* Chart + Bars */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          marginTop: "10px",
        }}
      >
        {/* Donut Chart */}
        <div style={{ width: "120px", height: "120px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Labels + Bars */}
        <div style={{ width: "180px" }}>
          {data.map((item, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: "#6E6E6E",
                }}
              >
                <span>{item.name}</span>
                <span>({getPercent(item.name)}%)</span>
              </div>
              <div
                style={{
                  height: "5px",
                  borderRadius: "5px",
                  backgroundColor: "#E4E4E4",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    width: `${getPercent(item.name)}%`,
                    height: "100%",
                    backgroundColor: COLORS[index],
                    borderRadius: "5px",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
