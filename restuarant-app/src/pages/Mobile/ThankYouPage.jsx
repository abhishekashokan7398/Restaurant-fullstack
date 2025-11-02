import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderType, totalAmount, userName, orderData, skipUserForm } = location.state || {};
  const [countdown, setCountdown] = useState(5); // 5 seconds countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // ✅ Redirect to Mobilehome and skip form
          navigate("/", { state: { skipUserForm: true } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#10B981",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#FFFFFF",
          marginBottom: "15px",
        }}
      >
        Thank You For Ordering!
      </h1>

      <div
        style={{
          width: "100px",
          height: "100px",
          backgroundColor: "black",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <span style={{ fontSize: "50px", color: "white" }}>✓</span>
      </div>

      <p
        style={{
          fontSize: "14px",
          color: "#FFFFFF",
          marginBottom: "5px",
        }}
      >
        Redirecting to home in
      </p>

      <p
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#FFFFFF",
        }}
      >
        {countdown} second{countdown !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default ThankYouPage;
