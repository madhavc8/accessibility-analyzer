import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getFirestore, collection, query, where, getDocs, orderBy, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import './UserDashboard.css';

const db = getFirestore();

const UserDashboard = ({ isVisible }) => {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    // Only fetch data if the dashboard is visible and user is logged in
    if (isVisible && auth.currentUser) {
      fetchUserHistory();
    }
  }, [isVisible]);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser.uid;
      
      // Query the analyses collection for this user's records
      const analysesRef = collection(db, 'analyses');
      const q = query(
        analysesRef, 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() // Convert Firestore timestamp to JS Date
        });
      });
      
      setAnalysisHistory(history);
      setError(null);
    } catch (err) {
      console.error('Error fetching user history:', err);
      setError('Failed to load your analysis history');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a single analysis record
  const deleteAnalysisRecord = async (recordId) => {
    if (!auth.currentUser || !recordId) return;
    
    try {
      setDeletingItemId(recordId);
      
      // Delete the specific document
      await deleteDoc(doc(db, 'analyses', recordId));
      
      // Update state to remove the deleted item
      setAnalysisHistory(prevHistory => 
        prevHistory.filter(item => item.id !== recordId)
      );
      
      setShowDeleteConfirmation(false);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'history-cleared-notification';
      notification.textContent = 'Record deleted successfully';
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
      
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record');
    } finally {
      setDeletingItemId(null);
    }
  };

  // Function to clear all user history
  const clearAllHistory = async () => {
    if (!auth.currentUser) return;
    
    try {
      setClearingHistory(true);
      const userId = auth.currentUser.uid;
      
      // Query all analyses for this user
      const analysesRef = collection(db, 'analyses');
      const q = query(analysesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      // Use a batch to delete all documents
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(doc(db, 'analyses', document.id));
      });
      
      // Commit the batch
      await batch.commit();
      
      // Update state
      setAnalysisHistory([]);
      setShowConfirmation(false);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'history-cleared-notification';
      notification.textContent = 'Analysis history cleared successfully';
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
      
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear analysis history');
    } finally {
      setClearingHistory(false);
    }
  };
  
  // Confirmation dialog for clearing history
  const ConfirmationDialog = () => (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <h3>Clear All History?</h3>
        <p>This action cannot be undone. All your analysis history will be permanently deleted.</p>
        <div className="confirmation-buttons">
          <button 
            className="cancel-button"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </button>
          <button 
            className="confirm-button"
            onClick={clearAllHistory}
            disabled={clearingHistory}
          >
            {clearingHistory ? 'Clearing...' : 'Yes, Clear All'}
          </button>
        </div>
      </div>
    </div>
  );

  // Confirmation dialog for deleting a single record
  const DeleteConfirmationDialog = () => (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <h3>Delete This Record?</h3>
        <p>This action cannot be undone. This analysis record will be permanently deleted.</p>
        <div className="confirmation-buttons">
          <button 
            className="cancel-button"
            onClick={() => {
              setShowDeleteConfirmation(false);
              setDeletingItemId(null);
            }}
          >
            Cancel
          </button>
          <button 
            className="confirm-button"
            onClick={() => deleteAnalysisRecord(deletingItemId)}
            disabled={!deletingItemId}
          >
            {deletingItemId === null ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
  
  if (!isVisible) return null;
  
  if (!auth.currentUser) {
    return (
      <div className="dashboard-container">
        <h2>Please log in to view your dashboard</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Your Analysis History</h2>
      
      {loading && <div className="dashboard-loading">Loading your history...</div>}
      
      {error && <div className="dashboard-error">{error}</div>}
      
      {!loading && !error && analysisHistory.length === 0 && (
        <div className="no-history">You haven't performed any analyses yet.</div>
      )}
      
      {!loading && !error && analysisHistory.length > 0 && (
        <>
          <div className={`history-list ${analysisHistory.length === 1 ? 'single-item' : ''}`}>
            {analysisHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <h3 className="analyzed-url">{item.url}</h3>
                  <span className="analysis-date">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown date'}
                  </span>
                </div>
                
                <div className="analysis-summary">
                  <div className="summary-stat">
                    <span className="stat-label">Score:</span>
                    <span className="stat-value">{item.score}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Errors:</span>
                    <span className="stat-value error-count">{item.errorCount}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Warnings:</span>
                    <span className="stat-value warning-count">{item.warningCount}</span>
                  </div>
                </div>
                
                <div className="history-item-actions">
                  <button 
                    className="view-details-button"
                    onClick={() => window.location.href = `?analysisId=${item.id}`}
                  >
                    View Details
                  </button>
                  
                  <button 
                    className="delete-record-button"
                    onClick={() => {
                      setDeletingItemId(item.id);
                      setShowDeleteConfirmation(true);
                    }}
                    disabled={deletingItemId === item.id}
                    title="Delete this record"
                    aria-label="Delete this record"
                  >
                    {deletingItemId === item.id ? 
                      <span className="deleting-spinner"></span> : 
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Clear History Button */}
          <div className="clear-history-container">
            <button 
              className="clear-history-button"
              onClick={() => setShowConfirmation(true)}
              disabled={clearingHistory}
            >
              Clear All History
            </button>
          </div>
        </>
      )}
      
      {/* Confirmation Dialogs */}
      {showConfirmation && <ConfirmationDialog />}
      {showDeleteConfirmation && <DeleteConfirmationDialog />}
    </div>
  );
};

export default UserDashboard;
