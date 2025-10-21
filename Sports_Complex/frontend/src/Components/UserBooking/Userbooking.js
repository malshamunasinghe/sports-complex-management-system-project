import React, { useEffect, useState, useCallback } from 'react';
import API from '../../utils/api';
import BookingForm from './BookingForm';
import './Userbooking.css';
import Nav from '../Nav/Nav';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


function UserBooking({ userId }) {
    const [bookings, setBookings] = useState([]);

    const fetchBookings = async () => {
        const res = await API.get('/api/v1/bookings');
        setBookings(res.data.filter(b => b.userId === userId)); // only their own bookings
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Generate a simple PDF receipt for a booking
    const downloadBookingPdf = useCallback((b) => {
        try {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const left = 40;
            let y = 50;

            doc.setFontSize(18);
            doc.text(`Booking Receipt`, left, y);
            y += 26;

            doc.setFontSize(11);
            const write = (label, value) => {
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, left, y);
                doc.setFont(undefined, 'normal');
                const val = value !== undefined && value !== null ? String(value) : '—';
                doc.text(val, left + 120, y);
                y += 16;
            };

            write('Booking ID', b._id);
            write('Name', b.name || b.userName || b.customer || '—');
            write('Sport / Event', b.sport || b.eventName || '—');
            write('Venue', b.venue || b.location || '—');
            try {
                const dateStr = b.date ? new Date(b.date).toLocaleString() : (b.dateString || '—');
                write('Date & Time', `${dateStr}${b.time ? ' • ' + b.time : ''}`);
            } catch (e) {
                write('Date & Time', `${b.date || b.time || '—'}`);
            }
            write('Duration', b.duration || '—');
            write('Seats / Zone', b.seats || b.zone || '—');
            write('Amount', (b.price != null ? '₹' + b.price : (b.amount != null ? '₹' + b.amount : '—')));
            write('Payment ID', b.paymentId || b.txnId || '—');
            write('Status', b.status || '—');
            write('Created', b.createdAt ? new Date(b.createdAt).toLocaleString() : '—');

            // If there are notes or comments, add them below
            if (b.notes || b.notes === '' || b.comment) {
                y += 6;
                doc.setFontSize(12);
                doc.text('Notes:', left, y);
                y += 14;
                doc.setFontSize(10);
                const notesText = (b.notes || b.comment || '').split('\n');
                doc.text(notesText, left, y);
            }

            const filename = `booking-${b._id || 'receipt'}.pdf`;
            doc.save(filename);
        } catch (err) {
            console.error('PDF generation failed', err);
            window.alert('Failed to generate PDF. Check console for details.');
        }
    }, []);

    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const filtered = bookings.filter(b => {
        const matchesQuery = query.trim() === '' || (b.eventName || b.sport || '').toLowerCase().includes(query.toLowerCase()) || (b._id || '').toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (b.status && b.status.toLowerCase() === statusFilter);
        return matchesQuery && matchesStatus;
    });

    const stats = bookings.reduce((acc, b) => {
        const st = (b.status || 'unknown').toLowerCase();
        acc.total += 1;
        if (st === 'confirmed' || st === 'active') acc.upcoming += 1;
        if (st === 'cancelled' || st === 'canceled') acc.cancelled += 1;
        if (st === 'completed' || st === 'past') acc.past += 1;
        return acc;
    }, { total: 0, upcoming: 0, past: 0, cancelled: 0 });

    return (
        <div className="user-booking-container enhanced">
            <Nav />
            <div className="user-booking-header">
                <h1>Your Bookings</h1>
                <p>Manage your personal bookings</p>
            </div>

            <div className="controls-row">
                <div className="stats-bar">
                    <div className="stat">Total: {stats.total}</div>
                    <div className="stat">Upcoming: {stats.upcoming}</div>
                    <div className="stat">Past: {stats.past}</div>
                    <div className="stat">Cancelled: {stats.cancelled}</div>
                </div>

                <div className="search-filter">
                    <input className="search-input" placeholder="Search by event or booking ID" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <select className="status-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button className="btn create-button" onClick={() => setShowForm(true)}>+ Create Booking</button>
                </div>
            </div>

            <div className="user-bookings-list enhanced-list">
                {filtered.length > 0 ? (
                    filtered.map(b => (
                        <div className="user-booking-card" key={b._id}>
                            <div className="booking-card-header">
                                <div className="booking-thumbnail">🏟️</div>
                                <div className="booking-head-info">
                                    <h3 className="booking-title">{b.eventName || b.sport || 'Booking'}</h3>
                                    <div className="booking-sub">ID: {b._id}</div>
                                    <div className="booking-sub small">{b.venue || b.location || '—'}</div>
                                </div>
                                <div className={`badge ${b.status ? b.status.toLowerCase() : ''}`}>{b.status || '—'}</div>
                            </div>

                            <div className="user-booking-details rich">
                                <div className="user-booking-detail">
                                    <span className="user-booking-detail-label">When</span>
                                    <span className="user-booking-detail-value">{b.date ? new Date(b.date).toLocaleDateString() : (b.dateString || '—')}</span>
                                </div>
                                <div className="user-booking-detail">
                                    <span className="user-booking-detail-label">Time</span>
                                    <span className="user-booking-detail-value">{b.time || '—'}</span>
                                </div>
                                <div className="user-booking-detail">
                                    <span className="user-booking-detail-label">Seats</span>
                                    <span className="user-booking-detail-value">{b.seats || b.zone || '—'}</span>
                                </div>
                                <div className="user-booking-detail">
                                    <span className="user-booking-detail-label">Amount</span>
                                    <span className="user-booking-detail-value">{b.price != null ? '₹' + b.price : (b.amount != null ? '₹' + b.amount : '—')}</span>
                                </div>
                            </div>

                            <div className="booking-actions">
                                <button className="btn btn-view" onClick={() => setSelected(b)}>Details</button>
                                <button className="btn btn-cancel" onClick={async () => {
                                    if (!window.confirm('Cancel this booking?')) return;
                                    try {
                                        await API.delete(`/api/v1/bookings/${b._id}`);
                                        fetchBookings();
                                    } catch (err) {
                                        console.error('Cancel failed', err);
                                        window.alert('Failed to cancel booking');
                                    }
                                }}>Cancel</button>
                                <button className="btn btn-download" onClick={() => downloadBookingPdf(b)}>⬇️ Download</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-user-bookings">
                        <p>No bookings match your filters. Try clearing the search.</p>
                    </div>
                )}
            </div>

            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelected(null)}>✖</button>
                        <h3>Booking Details</h3>
                        <dl className="modal-details">
                            <dt>Booking ID</dt><dd>{selected._id}</dd>
                            <dt>Name</dt><dd>{selected.name}</dd>
                            <dt>Event</dt><dd>{selected.eventName || selected.sport}</dd>
                            <dt>Venue</dt><dd>{selected.venue || selected.location}</dd>
                            <dt>Date & Time</dt><dd>{selected.date ? new Date(selected.date).toLocaleString() : selected.dateString} {selected.time ? ' • ' + selected.time : ''}</dd>
                            <dt>Seats</dt><dd>{selected.seats || selected.zone}</dd>
                            <dt>Amount</dt><dd>{selected.price != null ? '₹' + selected.price : (selected.amount != null ? '₹' + selected.amount : '—')}</dd>
                            <dt>Status</dt><dd>{selected.status}</dd>
                            <dt>Notes</dt><dd>{selected.notes || selected.comment || '—'}</dd>
                        </dl>
                        <div className="modal-actions">
                            <button className="btn btn-download" onClick={() => downloadBookingPdf(selected)}>⬇️ Download</button>
                            <button className="btn btn-close" onClick={() => setSelected(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="modal-backdrop" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowForm(false)}>✖</button>
                        <h3>{'Create Booking'}</h3>
                        <BookingForm fetchBookings={fetchBookings} userId={userId} onClose={() => setShowForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserBooking;