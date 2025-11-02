import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

function RevenueSummary() {
  const [period, setPeriod] = useState("daily");
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axios.get(
          `https://restaurant-fullstack-svjm.vercel.app/api/order/revenue/summary?period=${period}`
        );
        console.log("Revenue summary response:", res.data);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching revenue summary:", error);
        setData([]);
      }
    };
    fetchRevenue();
  }, [period]);

  return (
    <div style={{ height: "302px", width: "400px", backgroundColor: "#F0F5F3",
                  borderRadius: "8px", border: "2px solid #D9D9D9", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "370px", height: "70px", borderBottom: "2px solid #D9D9D9",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 15px" }}>
        <h4 style={{ color: "#6E6E6E", fontSize: "18px", fontWeight: "600" }}>
          Revenue
        </h4>

        <select value={period} onChange={e => setPeriod(e.target.value)}
                style={{ height: "40px", border: "2px solid #D9D9D9",
                         color: "#6E6E6E", padding: "0 10px", borderRadius: "20px",
                         backgroundColor: "white", outline: "none", marginRight: "30px" }}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px",
                    margin: "10px 10px", padding: "15px", height: "150px",
                    width: "350px", boxShadow: "0 0 3px rgba(0,0,0,0.1)" }}>
  <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#F7F7F7" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6E6E6E", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`₹${value}`, "Revenue"]}
              contentStyle={{
                borderRadius: "10px",
                borderColor: "#D9D9D9",
                backgroundColor: "#fff",
              }}
            />
            <Line
              type="natural"
              dataKey="revenue"
              stroke="#000"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#000" }}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}

export default RevenueSummary;
