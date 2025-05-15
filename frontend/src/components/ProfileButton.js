import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import AuthModal from './AuthModal';
import './ProfileButton.css';

const ProfileButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="profile-container">
      <button className="profile-button" onClick={toggleModal}>
        <span className="profile-icon">
          {isLoggedIn ? userEmail.charAt(0).toUpperCase() : '👤'}
        </span>
      </button>
      
      {isModalOpen && (
        <AuthModal 
          isLoggedIn={isLoggedIn} 
          userEmail={userEmail}
          closeModal={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ProfileButton;
