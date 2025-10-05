import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { useAuth } from "../../Context/AuthContext";

function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const landingBgStyle = {
    minHeight: "100vh",
    width: "100vw",
    background: "url('/cricket.jpeg') center center/cover no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5003/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const user = await res.json();
      if (res.ok) {
        login(user);
        if (user.role === "admin") navigate("/userdetails");
        else navigate("/home");
      } else {
        alert(user.message || "Login failed");
      }
    } catch {
      alert("Network error, try again.");
    }
  };

  return (
    <div style={landingBgStyle}>
      <div className="login-form-glass">
        <h2>Login Form</h2>
        <form className="landing-form" onSubmit={handleLogin}>
          <div className="input-wrapper">
            <span className="input-icon">&#128231;</span>
            <input
              type="email"
              placeholder="Email or Phone"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <span className="input-icon">&#128274;</span>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {/* Make this look and act like a link */}
          <div className="forgot-row">
            <span
              className="forgot"
              style={{ color: "#218639", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>
          <button className="login-btn" type="submit">LOGIN</button>
        </form>
        <div className="signup-row">
          <span>Don't have account? </span>
          <span className="signup-link" onClick={() => navigate("/register")}>SignUp Now</span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
