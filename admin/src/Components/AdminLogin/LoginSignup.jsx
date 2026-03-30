import React, { useState } from "react";
import "./LoginSignup.css";

const AdminAuth = () => {

  const [isSignup, setIsSignup] = useState(true);

  const [formData, setFormData] = useState({
    shopName: "",
    shopNumber: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const signup = async () => {
    if (!formData.email || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    const response = await fetch("https://shopper-backend-f01t.onrender.com/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.shopName,
        email: formData.email,
        password: formData.password
      }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("auth-token", data.token);
      alert("Signup Successful ✅");
      setIsSignup(false);
    } else {
      alert(data.errors);
    }
  };

  const login = async () => {
    if (!formData.email || !formData.password) {
      alert("Enter email & password");
      return;
    }

    const response = await fetch("https://shopper-backend-f01t.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("auth-token", data.token);
      window.location.replace("/addproduct");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <h1>{isSignup ? "Create Admin Account" : "Welcome Back 👋"}</h1>

        {isSignup && (
          <input
            type="text"
            name="shopName"
            placeholder="Shop Name"
            value={formData.shopName}
            onChange={handleChange}
          />
        )}

        <input
          type="text"
          name="shopNumber"
          placeholder="Shop Number"
          value={formData.shopNumber}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <p className="toggle-text">
          {isSignup ? "Already have an account?" : "New here?"}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? " Login" : " Sign Up"}
          </span>
        </p>

        <button onClick={() => isSignup ? signup() : login()}>
          {isSignup ? "Create Account" : "Login"}
        </button>

      </div>
    </div>
  );
};

export default AdminAuth;
