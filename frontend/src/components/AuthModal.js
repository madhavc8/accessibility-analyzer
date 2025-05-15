import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './AuthModal.css';

const AuthModal = ({ isLoggedIn, userEmail, closeModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  // Function to handle user sign-up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      closeModal();
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
    }
  };

  // Function to handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeModal();
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message);
    }
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeModal();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeModal}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={closeModal}>&times;</button>
        
        {isLoggedIn ? (
          <div className="logged-in-container">
            <h2>Welcome, {userEmail}</h2>
            <button className="logout-button" onClick={handleLogout}>Log Out</button>
          </div>
        ) : (
          <div className="auth-forms">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${!isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(false)}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${isSignUp ? 'active' : ''}`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
              
              <button type="submit" className="auth-button">
                {isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
