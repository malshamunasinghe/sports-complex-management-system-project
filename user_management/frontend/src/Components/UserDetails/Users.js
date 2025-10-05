import React, { useEffect, useState } from "react";
import axios from "axios";
import './UserTable.css';
const URL = "http://localhost:5003/users";

function Users() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
const [editForm, setEditForm] = useState({
  name: '',
  email: '',
  status: '',
  role: '',
  profile: {
    phone: '',
    address: '',
    photo: ''
  }
});


  // Fetch users (initial load)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(URL);
        setUsers(res.data.users);
        setAllUsers(res.data.users);
      } catch (err) {
        console.error("Error fetching users:", err);
        alert("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let filteredUsers = [...allUsers];
    
    if (searchQuery) {
      filteredUsers = filteredUsers.filter(user =>
        Object.values(user).some(field =>
          field &&
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    if (statusFilter !== "all") {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    
    if (roleFilter !== "all") {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    filteredUsers.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    setUsers(filteredUsers);
    setNoResults(filteredUsers.length === 0);
    setCurrentPage(1);
  }, [allUsers, searchQuery, statusFilter, roleFilter, sortField, sortDirection]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      await axios.patch(`${URL}/${id}/status`, { 
        status: currentStatus === "active" ? "inactive" : "active" 
      });
      const res = await axios.get(URL);
      setUsers(res.data.users);
      setAllUsers(res.data.users);
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (id) => {
    try {
      await axios.post(`${URL}/${id}/reset-password`);
      alert("Password reset. Email sent.");
    } catch (err) {
      console.error("Error resetting password:", err);
      alert("Failed to reset password");
    }
  };

  // Updated edit functionality with role
const handleEditUser = (user) => {
  setEditingUser(user);
  setEditForm({
    name: user.name || '',
    email: user.email || '',
    status: user.status || 'active',
    role: user.role || 'customer',
    profile: {
      phone: user.profile?.phone || '',
      address: user.profile?.address || '',
      photo: user.profile?.photo || ''
    }
  });
  setIsEditModalOpen(true);
};


  const handleUpdateUser = async () => {
  if (!editForm.name.trim() || !editForm.email.trim()) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    setLoading(true);
    // Include profile in the request
    await axios.patch(`${URL}/${editingUser._id}`, {
      name: editForm.name,
      email: editForm.email,
      status: editForm.status,
      role: editForm.role,
      profile: {
        phone: editForm.profile.phone,
        address: editForm.profile.address,
        photo: editForm.profile.photo
      }
    });

    const res = await axios.get(URL);
    setUsers(res.data.users);
    setAllUsers(res.data.users);
    setIsEditModalOpen(false);
    setEditingUser(null);
    alert("User updated successfully.");
  } catch (err) {
    console.error("Error updating user:", err);
    alert("Failed to update user. Please check the console for more details.");
  } finally {
    setLoading(false);
  }
};


  // Delete functionality
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        await axios.delete(`${URL}/${user._id}`);
        
        const res = await axios.get(URL);
        setUsers(res.data.users);
        setAllUsers(res.data.users);
        setSelectedEmails(selectedEmails.filter(email => email !== user.email));
        alert("User deleted successfully.");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNotify = async () => {
    if (selectedEmails.length === 0) {
      alert("Please select users to notify.");
      return;
    }
    if (!notifyMsg.trim()) {
      alert("Please enter a notification message.");
      return;
    }
    
    try {
      await axios.post(`${URL}/notify`, { 
        emails: selectedEmails, 
        message: notifyMsg 
      });
      alert("Notifications sent.");
      setSelectedEmails([]);
      setNotifyMsg("");
    } catch (err) {
      console.error("Error sending notifications:", err);
      alert("Failed to send notifications");
    }
  };

  const handleSelect = (email) => {
    setSelectedEmails((emails) =>
      emails.includes(email) ? emails.filter((e) => e !== email) : [...emails, email]
    );
  };

  const handleSelectAll = () => {
    const currentPageUsers = getCurrentPageUsers();
    const allCurrentSelected = currentPageUsers.every(user => selectedEmails.includes(user.email));
    
    if (allCurrentSelected) {
      setSelectedEmails(emails => emails.filter(email => 
        !currentPageUsers.some(user => user.email === email)
      ));
    } else {
      const newEmails = currentPageUsers.map(user => user.email);
      setSelectedEmails(emails => [...new Set([...emails, ...newEmails])]);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5003/users/report/pdf', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user-report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedEmails.length === 0) {
      alert("Please select users first.");
      return;
    }
    
    try {
      setLoading(true);
      const selectedUsers = allUsers.filter(user => selectedEmails.includes(user.email));
      
      for (const user of selectedUsers) {
        await axios.patch(`${URL}/${user._id}/status`, { status: newStatus });
      }
      
      const res = await axios.get(URL);
      setUsers(res.data.users);
      setAllUsers(res.data.users);
      setSelectedEmails([]);
      alert(`${selectedUsers.length} users ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      console.error("Error bulk updating status:", err);
      alert('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getCurrentPageUsers = () => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return users.slice(indexOfFirstUser, indexOfLastUser);
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const currentPageUsers = getCurrentPageUsers();

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'status-badge status-active';
      case 'inactive': return 'status-badge status-inactive';
      default: return 'status-badge';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-badge role-admin';
      case 'staff': return 'role-badge role-staff';
      case 'customer': return 'role-badge role-customer';
      default: return 'role-badge role-default';
    }
  };

  return (
    <div className="users-table-container">
      {loading && <div className="loading-overlay">Loading...</div>}
      
      
      <div className="header-section">
        <h2 className="table-title">User Management</h2>
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-number">{allUsers.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{allUsers.filter(u => u.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{allUsers.filter(u => u.status === 'inactive').length}</span>
            <span className="stat-label">Inactive</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{allUsers.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search name, email or role"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="action-controls">
          <button onClick={handleDownloadReport} className="report-download">
            📊 Download Report (PDF)
          </button>
          {selectedEmails.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selectedEmails.length} selected</span>
              <button onClick={() => handleBulkStatusChange('active')} className="bulk-btn bulk-activate">
                ✅ Activate All
              </button>
              <button onClick={() => handleBulkStatusChange('inactive')} className="bulk-btn bulk-deactivate">
                ❌ Deactivate All
              </button>
            </div>
          )}
        </div>
      </div>

      {noResults && <p>No users found.</p>}
      
      
      <div className="table-wrapper">
        <table className="wide-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={currentPageUsers.length > 0 && currentPageUsers.every(user => selectedEmails.includes(user.email))}
                  className="select-all-checkbox"
                />
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {getSortIcon('email')}
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                Role {getSortIcon('role')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {getSortIcon('status')}
              </th>
              <th>Password</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPageUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(user.email)}
                    onChange={() => handleSelect(user.email)}
                  />
                </td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>
                  <span className={getRoleBadgeClass(user.role)}>
                    {(user.role || 'customer').charAt(0).toUpperCase() + (user.role || 'customer').slice(1)}
                  </span>
                </td>
                <td>
                  <span className={getStatusBadgeClass(user.status)}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <span className="password-field">*******</span>
                  <span className="password-note">(Protected)</span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="btn-update"
                      title="Edit User"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user._id, user.status)}
                      className={user.status === "active" ? "btn-deactivate" : "btn-activate"}
                      title={user.status === "active" ? "Deactivate User" : "Activate User"}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="btn-delete"
                      title="Delete User"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
{isEditModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h3>Edit User</h3>
        <button 
          className="modal-close"
          onClick={() => setIsEditModalOpen(false)}
        >
          ✕
        </button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label htmlFor="edit-name">Name:</label>
          <input
            id="edit-name"
            type="text"
            value={editForm.name}
            onChange={e => setEditForm({...editForm, name: e.target.value})}
            className="form-input"
            placeholder="Enter user name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-email">Email:</label>
          <input
            id="edit-email"
            type="email"
            value={editForm.email}
            onChange={e => setEditForm({...editForm, email: e.target.value})}
            className="form-input"
            placeholder="Enter email address"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-role">Role:</label>
          <select
            id="edit-role"
            value={editForm.role}
            onChange={e => setEditForm({...editForm, role: e.target.value})}
            className="form-select"
          >
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="edit-status">Status:</label>
          <select
            id="edit-status"
            value={editForm.status}
            onChange={e => setEditForm({...editForm, status: e.target.value})}
            className="form-select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {/* Profile fields */}
        <div className="form-group">
          <label htmlFor="edit-phone">Phone:</label>
          <input
            id="edit-phone"
            type="text"
            value={editForm.profile.phone}
            onChange={e => setEditForm({...editForm, profile: {...editForm.profile, phone: e.target.value}})}
            className="form-input"
            placeholder="Phone number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-address">Address:</label>
          <input
            id="edit-address"
            type="text"
            value={editForm.profile.address}
            onChange={e => setEditForm({...editForm, profile: {...editForm.profile, address: e.target.value}})}
            className="form-input"
            placeholder="Home address"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-photo">Photo URL:</label>
          <input
            id="edit-photo"
            type="text"
            value={editForm.profile.photo}
            onChange={e => setEditForm({...editForm, profile: {...editForm.profile, photo: e.target.value}})}
            className="form-input"
            placeholder="Photo URL"
          />
        </div>
        {/* End profile fields */}
        <div className="form-group">
          <label>Password:</label>
          <div className="password-readonly">
            <span>*******</span>
            <small>(Password cannot be changed here for security reasons)</small>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button 
          onClick={() => setIsEditModalOpen(false)}
          className="btn-cancel"
        >
          Cancel
        </button>
        <button 
          onClick={handleUpdateUser}
          className="btn-save"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}


      {/* Pagination */}
      <div className="pagination-section">
        <div className="pagination-info">
          Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, users.length)} of {users.length} users
        </div>
        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Notification Section */}
      <div className="notification-section">
        <h3>Send Notifications</h3>
        <div className="notification-controls">
          <input
            placeholder="Enter notification message..."
            value={notifyMsg}
            onChange={e => setNotifyMsg(e.target.value)}
            className="notification-input"
          />
          <button onClick={handleNotify} className="send-notification-btn">
            📧 Send to Selected ({selectedEmails.length})
          </button>
        </div>
        {selectedEmails.length > 0 && (
          <div className="selected-users-preview">
            <strong>Selected users:</strong> {selectedEmails.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;