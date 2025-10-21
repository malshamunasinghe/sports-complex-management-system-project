// src/components/Manager/EventRegistrations.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import './EventRegistrations.css';

function EventRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    API.get(`/api/v1/events/${id}/registrations`)
      .then(res => setRegistrations(res.data))
      .catch(err => handleError(err, 'Fetching registrations failed'));

    API.get(`/api/v1/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => handleError(err, 'Fetching event details failed'));
  }, [id]);

  const handleError = (err, customMessage) => {
    console.error(err);
    const errorMsg =
      err.response?.data?.error ||
      err.response?.data?.msg ||
      err.message ||
      'Unknown error';
    alert(`${customMessage}:\n${JSON.stringify(errorMsg, null, 2)}`);
  };

  const handleAction = async (registrationId, action) => {
    try {
      if (action === 'approve') {
        await API.post(`/api/v1/events/registrations/${registrationId}/approve`);
        setRegistrations(registrations.map(r =>
          r._id === registrationId ? { ...r, status: 'approved' } : r
        ));
        alert('✅ Registration approved!');
      } else if (action === 'reject') {
        setSelectedRegistration(registrationId);
        setShowRejectModal(true);
      }
    } catch (err) {
      handleError(err, 'Updating registration status failed');
    }
  };

  const handleReject = async () => {
  // Trim the input
  const reasonTrimmed = rejectionReason.trim();

  // Validation: required
  if (!reasonTrimmed) {
    alert("❌ Rejection reason is required.");
    return;
  }

  // Validation: cannot be only numbers or symbols
  if (/^[0-9\s]+$/.test(reasonTrimmed) || /^[^a-zA-Z0-9]+$/.test(reasonTrimmed)) {
    alert("❌ Rejection reason cannot be only numbers or symbols.");
    return;
  }

  try {
    // API call to reject registration
    await API.post(`/api/v1/events/registrations/${selectedRegistration}/reject`, {
      reason: reasonTrimmed
    });

    // Update state locally
    setRegistrations(registrations.map(r =>
      r._id === selectedRegistration ? { ...r, status: 'rejected' } : r
    ));
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedRegistration(null);

    alert('❌ Registration rejected successfully');
  } catch (err) {
    handleError(err, 'Rejecting registration failed');
  }
};


  return (
    <div className="event-registrations-container">
      <div className="header-section">
        <h2>📋 Event Registrations</h2>
        {event && (
          <div className="event-info">
            <h3>{event.title}</h3>
            <p>📍 {event.venue} | 🗓 {new Date(event.registrationDeadline).toLocaleDateString()}</p>
          </div>
        )}
        <div className="action-buttons">
          <button className="back-btn" onClick={() => navigate('/events')}>← Back to Events</button>
        </div>
      </div>

      <div className="registrations-stats">
        <div className="stat-item">
          <span className="stat-number">{registrations.length}</span>
          <span className="stat-label">Total Registrations</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{registrations.filter(r => r.status === 'approved').length}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{registrations.filter(r => r.status === 'pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{registrations.filter(r => r.status === 'rejected').length}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      <table className="event-registrations-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Registration Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No registrations found for this event.
              </td>
            </tr>
          ) : (
            registrations.map(r => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td><span className={`status-badge ${r.status || 'pending'}`}>{r.status || 'pending'}</span></td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  {r.status === 'pending' ? (
                    <>
                      <button className="approve-btn" onClick={() => handleAction(r._id, 'approve')}>✅ Approve</button>
                      <button className="reject-btn" onClick={() => handleAction(r._id, 'reject')}>❌ Reject</button>
                    </>
                  ) : (
                    <span className="action-completed">
                      {r.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reject Registration</h3>
            <p>Please provide a reason (optional):</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows="4"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowRejectModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleReject} className="confirm-reject-btn">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventRegistrations;
