import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './AuthForms.css';

const AuthForms = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle user sign-up
  const handleSignUp = async (email, password) => {
    if (password.length < 6) {
      alert('Password should be at least 6 characters long.');
      return; // Exit the function if the password is too short
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User registered successfully!');
    } catch (error) {
      console.error('Error signing up:', error);
      alert(`Error: ${error.message}`); // Display the error message to the user
    }
  };

  // Function to handle user login
  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('User logged in successfully!');
    } catch (error) {
      console.error('Error logging in:', error);
      alert(`Error: ${error.message}`); // Display the error message to the user
    }
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('User logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-section">
        <h2>Sign Up</h2>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={() => handleSignUp(email, password)}>Sign Up</button>
      </div>

      <div className="auth-section">
        <h2>Login</h2>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={() => handleLogin(email, password)}>Login</button>
      </div>

      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AuthForms;
