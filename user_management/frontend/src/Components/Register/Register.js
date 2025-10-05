import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "customer"
  });

  const registerBgStyle = {
    minHeight: "100vh",
    width: "100vw",
    background: "url('/football-stadium.jpg') center center/cover no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
  e.preventDefault();

  // Step 1: Required Fields
  if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.phone) {
    alert("All fields are required!");
    return;
  }

  // Step 2: Email Format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(form.email)) {
    alert("Invalid email format!");
    return;
  }

  // Step 3: Phone Format - Must start with 0, exactly 10 digits, no letters, no special chars
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(form.phone)) {
    alert("Invalid phone number! Must start with 0, be exactly 10 digits, and have no letters or special characters.");
    return;
  }

  // Step 4: Password Length
  if (form.password.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }

  // Step 5: Password Match
  if (form.password !== form.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

    // Send registration data to backend
    try {
      const res = await fetch("http://localhost:5003/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          phone: form.phone
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        navigate("/"); // Redirect to login
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (error) {
      alert("Server error, please try again later.");
    }
  };

  return (
    <div className="register-bg">
      <div style={registerBgStyle}>
        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
          <p>
            Already have an account?
            <span className="login-link" onClick={() => navigate("/")}> Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
