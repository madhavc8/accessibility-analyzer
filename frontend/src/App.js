import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { auth } from './firebase';
import './App.css';
import './components/AppContainer.css';
import './components/AppNavigation.css';

// Import components
import ProfileButton from './components/ProfileButton';
import AnalysisForm from './components/AnalysisForm';
import Results from './components/Results';
import UserDashboard from './components/UserDashboard';
import ComparativeAnalysis from './components/ComparativeAnalysis';
// DetailedChartVisualization is used in Results.js, not directly in App.js

Chart.register(...registerables); // Register Chart.js components

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('analyzer'); // 'analyzer', 'dashboard', or 'compare'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsLoggedIn(true);
        // Store email but not using it directly in this component
        setUserEmail(user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      <h1>Accessibility Analyzer</h1>
      
      {/* Navigation */}
      {isLoggedIn && (
        <div className="app-navigation">
          <button 
            className={`nav-button ${currentView === 'analyzer' ? 'active' : ''}`}
            onClick={() => setCurrentView('analyzer')}
          >
            Analyzer
          </button>
          <button 
            className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            My Dashboard
          </button>
          <button 
            className={`nav-button ${currentView === 'compare' ? 'active' : ''}`}
            onClick={() => setCurrentView('compare')}
          >
            Compare Results
          </button>
        </div>
      )}
      
      {/* Analyzer View */}
      {currentView === 'analyzer' && (
        <>
          {/* Analysis Form Component */}
          <AnalysisForm setResult={setResult} setError={setError} />
          
          {/* Error Display */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Results Component (Chart + Issues) */}
          {result && <Results result={result} />}
        </>
      )}
      
      {/* Dashboard View */}
      {currentView === 'dashboard' && (
        <UserDashboard isVisible={currentView === 'dashboard'} />
      )}
      
      {/* Comparative Analysis View */}
      {currentView === 'compare' && (
        <ComparativeAnalysis />
      )}
      
      {/* Profile Button Component */}
      <ProfileButton />
    </div>
  );
}

export default App;