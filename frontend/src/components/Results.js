import React, { useState } from 'react';
import ChartVisualization from './ChartVisualization';
import DetailedChartVisualization from './DetailedChartVisualization';
import IssueDisplay from './IssueDisplay';
import './Results.css';

const Results = ({ result }) => {
  const [showDetailedCharts, setShowDetailedCharts] = useState(false);
  
  const calculateScore = () => {
    if (!result) return 100; // Default score if no result
    
    const errorCount = result.issues.filter(issue => issue.type === 'error').length;
    const warningCount = result.issues.filter(issue => issue.type === 'warning').length;
    
    // Improved score calculation logic - matches the logic in AnalysisForm.js
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
    return Math.max(10, 100 - (errorPenalty + warningPenalty));
  };

  const score = calculateScore();

  if (!result) return null;

  // Return the component UI
  return (
    <div className="results-container">
      <div className="results-header">
        <div className="results-header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <div className="results-header-text">
          <h2>Accessibility Analysis Results</h2>
          <p>We've analyzed your website and found the following accessibility issues</p>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-header">
          <h2>Website Accessibility Score</h2>
          <button 
            className={`chart-toggle-btn ${showDetailedCharts ? 'active' : ''}`}
            onClick={() => setShowDetailedCharts(!showDetailedCharts)}
          >
            {showDetailedCharts ? 'Show Basic Charts' : 'Show Detailed Charts'}
          </button>
        </div>
        
        <div className="score-display">
          <div className="score-circle">
            <span className="score-text">{score}</span>
          </div>
          <div className="score-info">
            <h3>{score >= 90 ? 'Excellent!' : score >= 70 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Poor'}</h3>
            <p>
              {score >= 90 
                ? 'Your website has very few accessibility issues. Keep up the good work!' 
                : score >= 70 
                ? 'Your website has some accessibility issues that should be addressed.' 
                : score >= 50 
                ? 'Your website has several accessibility issues that need attention.' 
                : 'Your website has significant accessibility issues that require immediate attention.'}
            </p>
          </div>
        </div>
        
        {showDetailedCharts ? (
          <DetailedChartVisualization result={result} score={score} />
        ) : (
          <ChartVisualization result={result} score={score} />
        )}
      </div>
      
      <IssueDisplay result={result} />
    </div>
  );
};

export default Results;
