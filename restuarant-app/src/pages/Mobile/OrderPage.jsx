import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AddCookingInstructions from "../../components/mobile/AddCookingInstructions";

function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedItems = [], userData = {} } = location.state || {};

  const [items, setItems] = useState(selectedItems);

  const [user, setUser] = useState({
    _id: userData._id || null,
    name: userData.name || "Guest User",
    phone: userData.contact || "0000000000",
    address: userData.address || "Not Provided",
    numberOfPersons: userData.numberOfPersons || 1,
  });

  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderType, setOrderType] = useState("Dine In");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Swipe-to‐order states
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeSuccess, setSwipeSuccess] = useState(false);
  const swipeContainerRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  useEffect(() => {
    const fetchUserByPhone = async () => {
      if (!user.phone || user.phone.length < 5) return;

      try {
        const res = await axios.get(
          `http://localhost:8000/api/user?contact=${user.phone}`
        );
        const matched = res.data;

        setUser({
          _id: matched._id,
          name: matched.name,
          phone: matched.contact,
          address: matched.address,
          numberOfPersons: matched.numberOfPersons,
        });
      } catch (err) {
        console.error("❌ Error fetching user by phone:", err);
      }
    };
    fetchUserByPhone();
  }, [user.phone]);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const chefRes = await axios.get("http://localhost:8000/api/chefs");
        setChefs(chefRes.data);
      } catch (err) {
        console.error("Error fetching chefs:", err);
      }
    };
    fetchChefs();
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const increment = id =>
    setItems(prev =>
      prev.map(item =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

  const decrement = id =>
    setItems(prev =>
      prev
        .map(item =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );

  const removeItem = id =>
    setItems(prev => prev.filter(item => item._id !== id));

  const assignChefs = (itemsList, chefsList) => {
    if (!chefsList.length) return itemsList;
    return itemsList.map((item, index) => ({
      ...item,
      assignedChef: chefsList[index % chefsList.length]._id,
    }));
  };

  const handleTouchStart = e => {
    if (loading || swipeSuccess) return;
    setIsSwiping(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
  };

  const handleTouchMove = e => {
    if (!isSwiping || loading || swipeSuccess) return;

    currentXRef.current = e.touches[0].clientX;
    const containerWidth = swipeContainerRef.current.offsetWidth;
    const thumbWidth = 60;
    const distance = Math.max(0, currentXRef.current - startXRef.current);
    const maxSwipeDistance = containerWidth - thumbWidth - 20;
    const progress = Math.min((distance / maxSwipeDistance) * 100, 100);
    setSwipeProgress(progress);

    // ✅ Trigger only once when threshold reached:
    if (progress >= 98 && !swipeSuccess && !loading) {
      handleSwipeComplete();
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping || loading || swipeSuccess) return;
    if (swipeProgress < 98) {
      setSwipeProgress(0);
    }
    setIsSwiping(false);
  };

  const handleSwipeComplete = async () => {
    if (swipeSuccess) return;  // extra guard
    setSwipeSuccess(true);
    setSwipeProgress(100);
    await placeOrder();
  };

  const navigateToThankYou = orderData => {
    navigate("/thank-you", {
      state: {
        orderType,
        totalAmount: total + (orderType === "Take Away" ? 55 : 5),
        userName: user.name,
        orderData,
      },
    });
  };

  const placeOrder = async () => {
    if (!items.length) {
      alert("No items selected!");
      setSwipeProgress(0);
      setSwipeSuccess(false);
      return;
    }

    const overstockItem = items.find(
      item => item.quantity > (item.stockQuantity || 0)
    );
    if (overstockItem) {
      alert(
        `Sorry — only ${overstockItem.stockQuantity} units of "${overstockItem.name}" available.`
      );
      setSwipeProgress(0);
      setSwipeSuccess(false);
      return;
    }

    setLoading(true);
    try {
      

      const assignedItems = assignChefs(items, chefs);
      const totalAmount = orderType === "Dine In" ? total + 5 : total + 55;
      const averageCookingTime =
        items.length > 0
          ? Math.round(
              items.reduce((sum, i) => sum + (i.averagePrepTime || 10), 0) /
                items.length
            )
          : 10;

      const formattedType = orderType === "Dine In" ? "dine-in" : "take-away";
      const validPartySize = user.numberOfPersons > 0 ? user.numberOfPersons : 1;

      const payload = {
        type: formattedType,
        userId: user._id || null,
        contact: user.phone,
        items: assignedItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        amount: totalAmount,
        totalAmount: totalAmount,
        cookingTime: averageCookingTime,
        chef: chefs.length ? chefs[0]._id : null,
      };

      if (formattedType === "dine-in") {
        payload.partySize = validPartySize;
      }

      const res = await axios.post("http://localhost:8000/api/order", payload, {
        timeout: 10000,
      });

     

      setTimeout(() => {
        navigateToThankYou(res.data);
      }, 1000);
    } catch (err) {
      console.error("❌ Order Error Details:");
      console.error("Error Message:", err.message);
      console.error("Response Data:", err.response?.data);
      console.error("Response Status:", err.response?.status);

      setSwipeProgress(0);
      setSwipeSuccess(false);

      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        alert(`Order Failed: ${serverMessage}`);
      } else if (
        err.code === "NETWORK_ERROR" ||
        err.code === "ECONNREFUSED"
      ) {
        alert("❌ Cannot connect to server. Make sure backend is running on port 8000.");
      } else if (err.message.includes("timeout")) {
        alert("❌ Request timeout. Server is taking too long to respond.");
      } else {
        alert("❌ Failed to place order. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#F9FAFB",
        fontFamily: "Inter, sans-serif",
        overflowY: "auto",
        padding: "20px",
        paddingBottom: "100px",
      }}
    >
      {/* Phone input for user */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter phone number"
          value={user.phone}
          onChange={e =>
            setUser(prev => ({ ...prev, phone: e.target.value }))
          }
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Items list */}
      {items.map(item => {
        const imgSrc = item.image
          ? item.image
          : item.imageUrl
          ? item.imageUrl
          : "https://placehold.co/110x90";

        return (
          <div
            key={item._id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              padding: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <img
                src={imgSrc}
                alt={item.name}
                style={{
                  width: "110px",
                  height: "100px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
                onError={e => {
                  e.currentTarget.src = "https://placehold.co/110x90";
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4 style={{ marginLeft: "10px" }}>{item.name}</h4>
                  <button
                    onClick={() => removeItem(item._id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "18px",
                      color: "#E74C3C",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ margin: "6px 10px", fontWeight: "500" }}>
                  ₹ {item.price}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => decrement(item._id)}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increment(item._id)}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
                <p
                  style={{
                    margin: "6px 0",
                    fontSize: "13px",
                    fontStyle: "italic",
                    color: "#8C7B7B",
                    textDecoration: "underline",
                    cursor: "pointer",
                    marginLeft: "-120px",
                  }}
                  onClick={() => {
                    setSelectedItemId(item._id);
                    setShowPopup(true);
                  }}
                >
                  {item.instruction
                    ? `📝 ${item.instruction}`
                    : "Add cooking instructions (optional)"}
                </p>
                <p
                  style={{
                    color: "#8C7B7B",
                    marginLeft: "-120px",
                    marginTop: "-10px",
                  }}
                >
                  ..............................................
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {showPopup && (
        <AddCookingInstructions
          onClose={() => setShowPopup(false)}
          onNext={instr => {
            setItems(prev =>
              prev.map(it =>
                it._id === selectedItemId ? { ...it, instruction: instr } : it
              )
            );
            setShowPopup(false);
          }}
        />
      )}

      {/* Order type toggle */}
      <div
        style={{
          backgroundColor: "#F3F4F6",
          borderRadius: "30px",
          display: "flex",
          width: "100%",
          marginBottom: "16px",
          overflow: "hidden",
          marginTop: "50px",
          height: "50px",
        }}
      >
        {["Dine In", "Take Away"].map(typeName => (
          <button
            key={typeName}
            onClick={() => setOrderType(typeName)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              backgroundColor:
                orderType === typeName ? "#fff" : "transparent",
              borderRadius: "30px",
              boxShadow:
                orderType === typeName ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
              fontWeight: "600",
              cursor: "pointer",
              height: "30px",
              margin: "15px",
            }}
          >
            {typeName}
          </button>
        ))}
      </div>

      {/* Bill summary */}
      <div
        style={{
          backgroundColor: "#FFF9E6",
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Item Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        {orderType === "Take Away" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Delivery Charge</span>
            <span>₹50.00</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Taxes</span>
          <span>₹5.00</span>
        </div>
        <hr />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
          }}
        >
          <span>Grand Total</span>
          <span>
            ₹
            {(total +
              (orderType === "Take Away" ? 55 : 5)).toFixed(2)}
          </span>
        </div>
      </div>

      {user && (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Your Details
          </h4>

          <p style={{ margin: "4px 0", fontWeight: "500" }}>
            👤 <strong>{user.name}</strong>
          </p>

          <p style={{ margin: "4px 0", color: "#555" }}>
            📞 {user.phone}
          </p>

          

          {orderType === "Dine In" && (
            <p style={{ margin: "4px 0", color: "#888" }}>
              🍽️ Party Size: <strong>{user.numberOfPersons}</strong>
            </p>
          )}

          {orderType === "Take Away" && (
            <div style={{ marginTop: "10px" }}>
            <p style={{ margin: "4px 0", color: "#555" }}>
            🏠 <strong>{user.address}</strong>
          </p>
              <p style={{ margin: "4px 0", fontSize: "14px", color: "green" }}>
                🚚 Delivery in <strong>~42 mins</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Swipe to Order */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          right: "20px",
          backgroundColor: "#fff",
          borderRadius: "50px",
          padding: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          ref={swipeContainerRef}
          style={{
            position: "relative",
            width: "100%",
            height: "60px",
            backgroundColor: "#f3f4f6",
            borderRadius: "50px",
            overflow: "hidden",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${swipeProgress}%`,
              backgroundColor: swipeSuccess ? "#10B981" : "#3B82F6",
              borderRadius: "50px",
              transition: swipeSuccess ? "all 0.3s ease" : "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "5px",
              left: `${swipeProgress}%`,
              transform: `translateX(-${
                swipeProgress > 0 ? swipeProgress * 0.6 : 0
              }px)`,
              width: "50px",
              height: "50px",
              backgroundColor: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transition: swipeSuccess ? "all 0.3s ease" : "none",
              zIndex: 10,
            }}
          >
            {swipeSuccess ? "✅" : "➜"}
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "16px",
              color: swipeProgress > 50 ? "#fff" : "#6B7280",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            {loading
              ? "Placing Order..."
              : swipeSuccess
              ? "Order Placed! ✅"
              : "Swipe to Place Order →"}
          </div>
        </div>
      </div>

      {message && <p style={{ marginTop: "12px" }}>{message}</p>}
    </div>
  );
}

export default OrderPage;
