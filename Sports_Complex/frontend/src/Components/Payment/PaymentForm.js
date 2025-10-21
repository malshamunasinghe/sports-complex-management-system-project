import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import './PaymentForm.css';
import Nav from '../Nav/Nav';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    method: "",
    sport: "",
    sportTime: "",
    amount: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  // Example options - replace with API-driven data if available
  const paymentMethods = [
    { id: 'card', label: 'Card' },
    { id: 'Debit', label: 'Debit' },
   
  ];

  const sports = [
    { id: 'badminton', label: 'Badminton' },
    { id: 'tennis', label: 'Tennis'  },
    { id: 'cricket', label: 'Cricket' },
     { id: 'basketball', label: 'Basketball' },
      { id: 'football', label: 'Football'  }
  ];

  const timesBySport = {
    badminton: ['06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00'],
    tennis: ['10:00 - 11:00', '11:00 - 12:00', '15:00 - 16:00'],
    football: ['16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00'],
     cricket: ['16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00'],
      basketball: ['16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00']

  };

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation
  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) tempErrors.email = "Invalid email address";
    if (!formData.phone.match(/^\d{10}$/)) tempErrors.phone = "Phone must be exactly 10 digits";
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) tempErrors.amount = "Valid amount is required";
    if (!formData.method || !String(formData.method).trim()) tempErrors.method = "Payment method is required";
    if (!formData.sport || !String(formData.sport).trim()) tempErrors.sport = "Sport selection is required";
    if (!formData.sportTime || !String(formData.sportTime).trim()) tempErrors.sportTime = "Sport time is required";

    // Only validate card fields when payment method is card
    if (formData.method === 'card') {
      if (!formData.cardNumber.match(/^\d{16}$/)) tempErrors.cardNumber = "Card number must be 16 digits";
      if (!formData.expiryMonth.match(/^(0[1-9]|1[0-2])$/)) tempErrors.expiryMonth = "Invalid month (01-12)";
      if (!formData.expiryYear.match(/^(20\d{2})$/)) tempErrors.expiryYear = "Invalid year";
      if (!formData.cvv.match(/^\d{3}$/)) tempErrors.cvv = "CVV must be 3 digits";
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // If sport changes, auto-fill amount and reset sportTime
      if (name === 'sport') {
        const s = sports.find(x => x.id === value);
        next.amount = s ? s.price : '';
        next.sportTime = '';
      }
      // If payment method changes and is not card, clear card fields
      if (name === 'method' && value !== 'card') {
        next.cardNumber = '';
        next.expiryMonth = '';
        next.expiryYear = '';
        next.cvv = '';
      }
      return next;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setIsSuccess(false);

    try {
      // Send to backend
      const res = await axios.post("http://localhost:5000/api/v1/payments", formData);
      
      setIsSuccess(true);
      setIsLoading(false);

      // Generate PDF
      const doc = new jsPDF();
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 210, 50, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("Payment Receipt", 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      let yPosition = 70;
      
      const receiptData = [
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        `Phone: ${formData.phone}`,
        `Sport: ${formData.sport}`,
        `Time: ${formData.sportTime}`,
        `Amount: $${formData.amount}`,
        `Payment Method: ${formData.method}`,
        `Date: ${new Date().toLocaleDateString()}`,
        `Transaction ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      ];

      receiptData.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 10;
      });

      doc.save(`receipt-${formData.name}-${Date.now()}.pdf`);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          method: "",
          sport: "",
          sportTime: "",
          amount: "",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cvv: "",
        });
        setIsSuccess(false);
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Payment failed! Please try again.");
      setIsLoading(false);
    }
  };

  return (

      <div className="payment-form-header">
          <Nav />
    <div className="payment-form-container">
    
      <form onSubmit={handleSubmit} className="payment-form">
        <h1 className="form-title">Sports Payment</h1>

        {isSuccess && (
          <div className="success-message">
             Payment successful! Downloading receipt...
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="10-digit number"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select name="method" value={formData.method} onChange={handleChange} className="form-input">
              <option value="">Select payment method</option>
              {paymentMethods.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            {errors.method && <span className="error-message">{errors.method}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Sport</label>
            <select name="sport" value={formData.sport} onChange={handleChange} className="form-input">
              <option value="">Select sport</option>
              {sports.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            {errors.sport && <span className="error-message">{errors.sport}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Sport Time</label>
            <select name="sportTime" value={formData.sportTime} onChange={handleChange} className="form-input">
              <option value="">Select time slot</option>
              {(timesBySport[formData.sport] || []).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.sportTime && <span className="error-message">{errors.sportTime}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Amount (Rs)</label>
          <input
            type="number"
            name="amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            className="form-input"
          />
          {errors.amount && <span className="error-message">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Card Details</label>
          <div className="card-details-row">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleChange}
              className="form-input"
              maxLength="16"
            />
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              value={formData.expiryMonth}
              onChange={handleChange}
              className="form-input"
              maxLength="2"
            />
            <input
              type="text"
              name="expiryYear"
              placeholder="YYYY"
              value={formData.expiryYear}
              onChange={handleChange}
              className="form-input"
              maxLength="4"
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={formData.cvv}
              onChange={handleChange}
              className="form-input"
              maxLength="3"
            />
          </div>
          <div className="error-messages">
            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            {errors.expiryMonth && <span className="error-message">{errors.expiryMonth}</span>}
            {errors.expiryYear && <span className="error-message">{errors.expiryYear}</span>}
            {errors.cvv && <span className="error-message">{errors.cvv}</span>}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              Processing...
            </>
          ) : (
            `Pay Rs:${formData.amount || '0'}`
          )}
        </button>
      </form>
    </div>
      </div>
  );
};

export default PaymentForm;