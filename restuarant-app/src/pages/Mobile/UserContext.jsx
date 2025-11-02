// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,           // add loading flag
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);    // new

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/user/profile", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUser({
          _id: null,
          name: "Guest User",
          phone: "",
          address: "",
          numberOfPersons: 1,
        });
      } finally {
        setLoading(false);    // done loading
      }
    };
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
