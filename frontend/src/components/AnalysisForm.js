import React, { useState } from 'react';
import { auth } from '../firebase';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import LoadingAnimation from './LoadingAnimation';
import './AnalysisForm.css';
import './SaveNotification.css';

const db = getFirestore(); // Initialize Firestore

const AnalysisForm = ({ setResult, setError }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    setLoading(true); // Start loading
    
    try {
      // Use environment variable for API URL or fallback to localhost for development
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        // Save results if user is logged in
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          await saveResults(userId, data);
          // Show a small notification that results were saved
          const notification = document.createElement('div');
          notification.className = 'save-notification';
          notification.textContent = 'Analysis saved to your dashboard';
          document.body.appendChild(notification);
          
          // Remove notification after 3 seconds
          setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 500);
          }, 3000);
        }
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false); // End loading
    }
  };

  const saveResults = async (userId, results) => {
    try {
      // Calculate score and counts
      const errorCount = results.issues.filter(issue => issue.type === 'error').length;
      const warningCount = results.issues.filter(issue => issue.type === 'warning').length;
      
      // Improved score calculation logic
      // Base score is 100
      // For the first 5 errors, deduct 5 points each
      // For additional errors, deduct 2 points each (with diminishing impact)
      // For the first 10 warnings, deduct 2 points each
      // For additional warnings, deduct 1 point each (with diminishing impact)
      // Ensure a minimum score of 10 for any website with issues
      
      let errorPenalty = 0;
      if (errorCount > 0) {
        // First 5 errors have higher impact
        errorPenalty = Math.min(errorCount, 5) * 5;
        
        // Additional errors have less impact
        if (errorCount > 5) {
          errorPenalty += Math.min(errorCount - 5, 15) * 2;
          
          // Cap the maximum error penalty at 50 points
          errorPenalty = Math.min(errorPenalty, 50);
        }
      }
      
      let warningPenalty = 0;
      if (warningCount > 0) {
        // First 10 warnings have higher impact
        warningPenalty = Math.min(warningCount, 10) * 2;
        
        // Additional warnings have less impact
        if (warningCount > 10) {
          warningPenalty += Math.min(warningCount - 10, 20) * 1;
          
          // Cap the maximum warning penalty at 40 points
          warningPenalty = Math.min(warningPenalty, 40);
        }
      }
      
      // Calculate final score with a minimum of 10
      const score = Math.max(10, 100 - (errorPenalty + warningPenalty));
      
      // Save to the analyses collection with more detailed information
      await addDoc(collection(db, 'analyses'), {
        userId,
        url,
        timestamp: serverTimestamp(),
        score,
        errorCount,
        warningCount,
        issues: results.issues,
      });
      
      console.log('Analysis results saved successfully!');
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="analyze-form">
        <label className="form-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          Website URL to Analyze
        </label>
        <div className="input-container">
          <input
            type="text"
            className="url-input"
            placeholder="Enter website URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <p className="form-helper-text">
          Enter a complete URL including https:// to analyze for accessibility issues.
        </p>
        <button type="submit" className="analyze-button" disabled={loading}>
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Analyze Accessibility
            </>
          )}
        </button>
      </form>
      
      {/* Show the loading animation when loading */}
      {loading && <LoadingAnimation />}
    </>
  );
};

export default AnalysisForm;
