import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../utils/api';

function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', details: '' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    const valStr = value ? value.trim() : '';

    switch (name) {
      case 'name':
        if (!valStr) error = 'Name is required.';
        else if (!/^[A-Za-z\s]{3,}$/.test(valStr))
          error = 'Name must be at least 3 letters and contain only alphabets.';
        break;

      case 'email':
        if (!valStr) error = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valStr))
          error = 'Enter a valid email address.';
        break;

      case 'phone':
        if (!valStr) error = 'Phone is required.';
        else if (!/^\d{10}$/.test(valStr))
          error = 'Phone number must be exactly 10 digits.';
        break;

      case 'details':
  if (!valStr) {
    error = "Details is required.";
  } else if (/^[0-9\s]+$/.test(valStr) || /^[^a-zA-Z0-9]+$/.test(valStr)) {
    error = "Details cannot be only numbers or symbols.";
  }
  break;


      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validate all fields before submitting
    Object.entries(form).forEach(([key, val]) => validateField(key, val));
    if (Object.values(errors).some(err => err)) {
      alert('Please fix errors before submitting.');
      return;
    }

    try {
      await API.post(`/api/v1/events/${id}/register`, form);
      alert('✅ Registration successful! ');
      navigate('/customer/events');
    } catch (err) {
      console.error(err);
      alert('❌ Error registering. Event might be full or server error.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎯 Event Registration</h1>
      <p style={styles.description}>
        Complete the form below to register for this exciting event. All fields marked with * are required.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.group}>
          <label>Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} style={styles.input} />
          {errors.name && <small style={styles.error}>{errors.name}</small>}
        </div>

        <div style={styles.group}>
          <label>Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} style={styles.input} />
          {errors.email && <small style={styles.error}>{errors.email}</small>}
        </div>

        <div style={styles.group}>
          <label>Phone *</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="0XXXXXXXXX" style={styles.input} />
          {errors.phone && <small style={styles.error}>{errors.phone}</small>}
        </div>

        <div style={styles.groupFull}>
          <label>Details (Optional)</label>
          <textarea name="details" value={form.details} onChange={handleChange} rows="4" style={styles.textarea}></textarea>
          {errors.details && <small style={styles.error}>{errors.details}</small>}
        </div>

        <button type="submit" style={styles.submitBtn}>Submit Registration</button>
        <button type="button" onClick={() => navigate('/customer/events')} style={styles.cancelBtn}>Cancel</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '30px auto', padding: '20px', background: '#f9f9f9', borderRadius: '12px', fontFamily: 'Segoe UI, sans-serif' },
  title: { textAlign: 'center', color: '#22c55e', marginBottom: '10px' },
  description: { textAlign: 'center', color: '#6b7280', marginBottom: '20px', fontSize: '14px' },
  form: { display: 'grid', gridTemplateColumns: '1fr', gap: '15px' },
  group: { display: 'flex', flexDirection: 'column' },
  groupFull: { display: 'flex', flexDirection: 'column' },
  input: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' },
  textarea: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' },
  error: { color: 'red', fontSize: '12px', marginTop: '4px' },
  submitBtn: { padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { padding: '10px', background: '#f87171', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }
};

export default RegisterEvent;
