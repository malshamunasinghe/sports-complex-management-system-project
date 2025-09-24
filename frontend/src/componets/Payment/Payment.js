import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Payment.css";
import Nav2 from "../Nav2/Nav2";
import { Link } from "react-router-dom";

const URL = "http://localhost:5000/api/users";


function Payment() {

   const [formData, setFormData] = useState({
    name: "",
    email: "",
    method: "",
    sport: "",
    sportTime: "",
    amount: "",
    phone: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users", formData); // backend URL
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        method: "",
        sport: "",
        sportTime: "",
        amount: "",
        phone: "",
      });
    } catch (err) {
      console.error("Error submitting payment:", err);
      alert("Error submitting payment");
    }
  };


  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(URL);
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else if (res.data.users && Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <Nav2 />
     <div className="body1">
      <div className="payment-container">
      <h2>Payment Form</h2>

      {success && <div className="success-message"> Payment Successful!</div>}

      <form onSubmit={handleSubmit} className="payment-form">
        <input type="text"name="name" placeholder="Full Name"value={formData.name}onChange={handleChange}required />

        <input type="text" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />

     
        <select name="method" value={formData.method} onChange={handleChange} required>
          <option value="">-- Select Payment Method --</option>
          <option value="Credit Card"> 💳 Credit Card</option>
          <option value="Master Card"> 💳Master Card</option>
        </select>

        <select name="sport" value={formData.sport} onChange={handleChange} required >
          <option value="">-- Select Sport --</option>
          <option value="Badminton">Badminton</option>
          <option value="Cricket">Cricket</option>
          <option value="Table Tennis">Table Tennis</option>
          <option value="Basketball">Basketball</option>
           <option value="volleyball">Volleyball</option>
        </select>


        <select name="sportTime" value={formData.sportTime} onChange={handleChange} required >
          <option value="">-- Select Booking Time --</option>
          <option value="8.00 - 9.00 AM">8.00 - 9.00 AM</option>
          <option value="9.00 - 10.00 AM">9.00 - 10.00 AM</option>
          <option value="10.00 - 11.00 AM">10.00 - 11.00 AM</option>
          <option value="5.00 - 6.00 PM">5.00 - 6.00 PM</option>
          <option value="6.00 - 7.00 PM">6.00 - 7.00 PM</option>
        </select>

        <input type="text" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />

        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
           <input type="text" name="cardN" placeholder="Card Number (1111-2222-3333-4444)"/>

        <button type="submit" className="pay-btn">Pay Now</button>
      </form>
    </div>

      
     

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        
        <div className="users-list">
          <Link to="/userdetails" state={{ users }}>
            <button>Payment Details</button>
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}

export default Payment;
