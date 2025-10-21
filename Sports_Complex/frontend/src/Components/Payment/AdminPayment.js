import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPayment.css";
import AdminNav from "../Admin/AdminNav";

const AdminPayment = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/v1/payments");
        console.log(res.data); // check backend response
        if (Array.isArray(res.data)) setUsers(res.data);
        else if (Array.isArray(res.data.users)) setUsers(res.data.users);
        else setUsers([]);
      } catch (err) {
        console.error(err);
        setUsers([]);
        setMessage("Error loading users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Edit user
  const handleEdit = (user) => {
    setEditing(user);
    setMessage("");
  };

  // Cancel editing
  const handleCancel = () => {
    setEditing(null);
    setMessage("");
  };

  // Update user
  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await axios.put(`http://localhost:5000/api/v1/payments/${editing._id}`, editing);
      setMessage("User updated successfully!");
      
      // Refresh users list
      const res = await axios.get("http://localhost:5000/api/v1/payments");
      if (Array.isArray(res.data)) setUsers(res.data);
      else if (Array.isArray(res.data.users)) setUsers(res.data.users);
      
      setTimeout(() => {
        setEditing(null);
        setMessage("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage("Error updating user");
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/payments/${id}`);
      setUsers(users.filter(u => u._id !== id));
      setMessage("User deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error deleting user");
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminNav />
      <br/>
      <h2 className="admin-header">Admin Panel - Payment User Management</h2>
      
      {message && (
        <div className={`message ${message.includes("Error") ? "message-error" : "message-success"}`}>
          {message}
        </div>
      )}

      <div className="admin-table-container">
        {users.length === 0 ? (
          <div className="empty-state">
            <h3>No Users Found</h3>
            <p>There are no users to display at the moment.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Sport</th>
                <th>Amount</th>
                <th>SportTime</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.sport}</td>
                  <td>Rs:{u.amount}/=</td>
                  <td>{u.sportTime}</td>
                  <td>{u.phone}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-edit" 
                        onClick={() => handleEdit(u)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-delete" 
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="edit-form">
          <h3>Edit User</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                className="form-input"
                value={editing.name} 
                onChange={e => setEditing({...editing, name: e.target.value})} 
                placeholder="Enter name" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                className="form-input"
                value={editing.email} 
                onChange={e => setEditing({...editing, email: e.target.value})} 
                placeholder="Enter email" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sport</label>
              <input 
                className="form-input"
                value={editing.sport} 
                onChange={e => setEditing({...editing, sport: e.target.value})} 
                placeholder="Enter sport" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input 
                className="form-input"
                value={editing.amount} 
                onChange={e => setEditing({...editing, amount: e.target.value})} 
                placeholder="Enter amount" 
              />
            </div>
             <div className="form-group">
              <label className="form-label">SportTime</label>
              <input 
                className="form-input"
                value={editing.sportTime} 
                onChange={e => setEditing({...editing, sportTime: e.target.value})} 
                placeholder="Enter sport time" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input 
                className="form-input"
                value={editing.phone} 
                onChange={e => setEditing({...editing, phone: e.target.value})} 
                placeholder="Enter phone number" 
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-update" onClick={handleUpdate}>
              Update User
            </button>
            <button className="btn btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayment;