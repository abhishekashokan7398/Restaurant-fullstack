import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/thanks.css";

function TickIcon() {
  return <FaCheck className="tick-icon" />;
}

function Thanks() {
  const navigate = useNavigate();
  const [count, setCount] = useState(50);

  useEffect(() => {
    // Create one timer that runs every second
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          navigate("/home"); // Redirect when countdown ends
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <>
      <div className="message">
        <h1>Thanks for Ordering</h1>
        <TickIcon />
      </div>

      <div className="redirectmessage">
        <h3>Redirecting in {count} seconds...</h3>
      </div>
    </>
  );
}

export default Thanks;
