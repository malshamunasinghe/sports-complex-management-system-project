import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserDetails.css";

const URL = "http://localhost:5000/api/users";

function UserDetailsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get(URL);
      // Extract array from object
      if (res.data.users && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${URL}/${id}`);
      fetchUsers(); // refresh after delete
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Edit user (example: edit name)
  const handleEdit = async (id, oldUser) => {
    const newName = prompt("Enter new name:", oldUser.name);
    if (!newName) return;
    const updatedUser = { ...oldUser, name: newName };

    try {
      await axios.put(`${URL}/${id}`, updatedUser);
      fetchUsers(); // refresh after edit
    } catch (err) {
      console.error("Error editing user:", err);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;
  if (users.length === 0) return <p>No users found.</p>;

  return (
    <div>
      <h1>All Users Details</h1>
      {users.map((user) => (
        <div key={user._id} className="user-card">
          <h2>{user.name}</h2>
          <p>Email: {user.email}</p>
          <p>Method: {user.method}</p>
          <p>Sport: {user.sport}</p>
          <p>Sport Time: {user.sportTime}</p>
          <p>Amount: {user.amount}</p>
          <p>Phone: {user.phone}</p>
          <div className="user-actions">
            <button onClick={() => handleEdit(user._id, user)}>Edit</button>
            <button onClick={() => handleDelete(user._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserDetailsPage;
