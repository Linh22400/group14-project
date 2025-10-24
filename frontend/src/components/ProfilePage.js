import React, { useState } from 'react';
import Profile from './Profile';
import ProfileForm from './ProfileForm';
import './ProfilePage.css';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedUser) => {
    setCurrentUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        {!isEditing ? (
          <Profile 
            user={currentUser} 
            onUpdateClick={handleEditClick} 
          />
        ) : (
          <ProfileForm 
            user={currentUser} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;