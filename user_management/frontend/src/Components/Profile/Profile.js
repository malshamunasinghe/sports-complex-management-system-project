// Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Load profile info
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setProfile(res.data.profile);
        setEditedProfile(res.data.profile);
      } catch (err) {
        console.error("Error loading profile", err);
      }
      setLoading(false);
    };
    loadProfile();
  }, [userId]);

  // Edit toggle
  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  // Save/update profile
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/users/${userId}`, { profile: editedProfile });
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to save profile.");
    }
    setSaving(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="profile-container">Loading profile...</div>;

  const display = isEditing ? editedProfile : profile;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={display.avatar_url || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="profile-avatar"
          />
          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={handleEdit} className="btn-edit">Edit Profile</button>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} className="btn-save">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancel} disabled={saving} className="btn-cancel">Cancel</button>
              </>
            )}
          </div>
        </div>
        <div className="profile-body">
          <div className="profile-field">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={display.full_name || ''}
                onChange={e => handleInputChange('full_name', e.target.value)}
                className="field-input"
              />
            ) : (
              <p className="field-value">{display.full_name}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Username</label>
            {isEditing ? (
              <input
                type="text"
                value={display.username || ''}
                onChange={e => handleInputChange('username', e.target.value)}
                className="field-input"
              />
            ) : (
              <p className="field-value">{display.username}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                value={display.bio || ''}
                onChange={e => handleInputChange('bio', e.target.value)}
                className="field-textarea"
                rows={3}
              />
            ) : (
              <p className="field-value">{display.bio}</p>
            )}
          </div>
          <div className="profile-field">
            <label>Website</label>
            {isEditing ? (
              <input
                type="text"
                value={display.website || ''}
                onChange={e => handleInputChange('website', e.target.value)}
                className="field-input"
              />
            ) : (
              <a href={display.website} target="_blank" rel="noopener noreferrer" className="field-link">
                {display.website}
              </a>
            )}
          </div>
          <div className="profile-field">
            <label>Twitter</label>
            {isEditing ? (
              <input
                type="text"
                value={display.twitter || ''}
                onChange={e => handleInputChange('twitter', e.target.value)}
                className="field-input"
              />
            ) : (
              <p className="field-value">{display.twitter}</p>
            )}
          </div>
          <div className="profile-field">
            <label>GitHub</label>
            {isEditing ? (
              <input
                type="text"
                value={display.github || ''}
                onChange={e => handleInputChange('github', e.target.value)}
                className="field-input"
              />
            ) : (
              <p className="field-value">{display.github}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
