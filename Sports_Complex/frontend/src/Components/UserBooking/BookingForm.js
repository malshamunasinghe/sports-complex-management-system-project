import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './BookingForm.css';



function BookingForm({ fetchBookings, editingBooking, setEditingBooking, userId, onClose }) {
    const [bookingData, setBookingData] = useState({ name: '', sport: '', date: '', time: '', paymentMethod: '', price: '' });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const sports = [
        { id: 'badminton', label: 'Badminton', price: 200 },
        { id: 'tennis', label: 'Tennis', price: 300 },
        { id: 'football', label: 'Football', price: 500 },
    ];

    const timesBySport = {
        badminton: ['06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00'],
        tennis: ['10:00 - 11:00', '11:00 - 12:00', '15:00 - 16:00'],
        football: ['16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00']
    };

    const paymentMethods = [
        { id: 'card', label: 'Card / Debit / Credit' },
        { id: 'upi', label: 'UPI' },
        { id: 'cash', label: 'Cash on arrival' }
    ];

    useEffect(() => {
        if (editingBooking) {
            setBookingData({
                name: editingBooking.name || '',
                sport: editingBooking.sport || editingBooking.eventName || '',
                date: editingBooking.date || editingBooking.dateString || '',
                time: editingBooking.time || '',
                paymentMethod: editingBooking.paymentMethod || '',
                price: editingBooking.price || editingBooking.amount || ''
            });
        }
    }, [editingBooking]);

    const validate = () => {
        const e = {};
        if (!bookingData.name.trim()) e.name = 'Name is required';
        if (!bookingData.sport) e.sport = 'Select a sport';
        if (!bookingData.date) e.date = 'Pick a date';
        if (!bookingData.time) e.time = 'Choose a time slot';
        if (!bookingData.paymentMethod) e.paymentMethod = 'Select payment method';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'sport') {
                const s = sports.find(x => x.id === value);
                next.price = s ? s.price : '';
                const available = timesBySport[value];
                next.time = Array.isArray(available) && available.length > 0 ? available[0] : '';
            }
            return next;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            if (editingBooking) {
                await API.put(`/api/v1/bookings/${editingBooking._id}`, bookingData);
                setEditingBooking(null);
            } else {
                await API.post('/api/v1/bookings', { ...bookingData, userId: userId || 'user1' });
            }
            setSuccess(true);
            fetchBookings();
            setTimeout(() => {
                setSuccess(false);
                setBookingData({ name: '', sport: '', date: '', time: '', paymentMethod: '', price: '' });
                if (typeof onClose === 'function') onClose();
            }, 900);
        } catch (err) {
            console.error(err);
            setErrors({ submit: 'Failed to save booking. Try again.' });
        }
    };

    return (
        <div className="booking-form-container">
           <form className="booking-form" onSubmit={handleSubmit}>
                <h2>{editingBooking ? 'Edit Booking' : 'Create New Booking'}</h2>
                {success && <div className="hint">Booking saved ✅</div>}
                <div className="row">
                  <input name="name" placeholder="Enter your name" value={bookingData.name} onChange={handleChange} />
                  <select name="sport" value={bookingData.sport} onChange={handleChange}>
                    <option value="">Select sport</option>
                    {sports.map(s => <option key={s.id} value={s.id}>{s.label} (₹{s.price})</option>)}
                  </select>
                </div>
                <div className="row">
                  <input type="date" name="date" value={bookingData.date} onChange={handleChange} />
                  <select name="time" value={bookingData.time} onChange={handleChange}>
                    <option value="">Select time</option>
                    {(timesBySport[bookingData.sport] || []).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="row">
                  <select name="paymentMethod" value={bookingData.paymentMethod} onChange={handleChange}>
                    <option value="">Payment method</option>
                    {paymentMethods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                  <input name="price" placeholder="Price" value={bookingData.price} onChange={handleChange} />
                </div>

                {errors.submit && <div className="error-message">{errors.submit}</div>}
                <div className="actions">
                  <button type="submit">{editingBooking ? 'Update Booking' : 'Add Booking'}</button>
                </div>
            </form>
        </div>
    );
}

export default BookingForm;