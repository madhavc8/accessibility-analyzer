import React, { useState } from 'react';
import './IssueDisplay.css';

const IssueDisplay = ({ result }) => {
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);

  if (!result) return null;
  
  if (!result.issues || result.issues.length === 0) {
    return <div className="result">No accessibility issues found!</div>;
  }

  return (
    <div className="result">
      <h2>Accessibility Issues Found:</h2>
      
      {/* Error Issues */}
      <div className="issue-category">
        <h3 onClick={() => setShowErrors(!showErrors)} style={{ cursor: 'pointer' }}>
          {showErrors ? '▼' : '►'} Errors
        </h3>
        {showErrors && (
          <ul>
            {result.issues
              .filter(issue => issue.type === 'error')
              .map((issue, index) => (
                <li key={index} className="issue-item error">
                  <div className="issue-header">
                    <div className="issue-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <strong>{issue.message}</strong>
                  </div>
                  <div className="issue-details">
                    <div className="issue-details-grid">
                      <div className="issue-detail-item">
                        <span className="issue-detail-label">Code</span>
                        <span className="issue-detail-value">{issue.code}</span>
                      </div>
                      <div className="issue-detail-item">
                        <span className="issue-detail-label">Selector</span>
                        <span className="issue-detail-value">{issue.selector}</span>
                      </div>
                    </div>
                    
                    <div className="issue-detail-item">
                      <span className="issue-detail-label">Context</span>
                      <span className="context-preview">{issue.context?.slice(0, 50)}...</span>
                    </div>
                    
                    <div className="issue-detail-item">
                      <span className="issue-detail-label">Description</span>
                      <span className="issue-detail-value">{issue.description}</span>
                    </div>
                    
                    <div className="issue-detail-item">
                      <span className="issue-detail-label">Suggestion</span>
                      <span className="issue-detail-value">{issue.suggestion}</span>
                    </div>
                    
                    <div className="issue-actions">
                      <a href={issue.resourceLink} target="_blank" rel="noopener noreferrer" className="issue-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Learn more
                      </a>
                      <a href={issue.guidelineLink} target="_blank" rel="noopener noreferrer" className="issue-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        View Guideline
                      </a>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
      
      {/* Warning Issues */}
      <div className="issue-category">
        <h3 onClick={() => setShowWarnings(!showWarnings)} style={{ cursor: 'pointer' }}>
          {showWarnings ? '▼' : '►'} Warnings
        </h3>
        {showWarnings && (
          <ul>
            {result.issues
              .filter(issue => issue.type === 'warning')
              .map((issue, index) => (
                <li key={index} className="issue-item warning">
                  <div className="issue-header">
                    <div className="issue-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                    <strong>{issue.message}</strong>
                  </div>
                  <div className="issue-details">
                    <div className="issue-details-grid">
                      <div className="issue-detail-item">
                        <span className="issue-detail-label">Code</span>
                        <span className="issue-detail-value">{issue.code}</span>
                      </div>
                      <div className="issue-detail-item">
                        <span className="issue-detail-label">Selector</span>
                        <span className="issue-detail-value">{issue.selector}</span>
                      </div>
                    </div>
                    
                    <div className="issue-detail-item">
                      <span className="issue-detail-label">Context</span>
                      <span className="context-preview">{issue.context?.slice(0, 50)}...</span>
                    </div>
                    
                    <div className="issue-detail-item">
                      <span className="issue-detail-label">Description</span>
                      <span className="issue-detail-value">{issue.description}</span>
                    </div>
                    
                    <div className="issue-detail-item">
                      <span className="issue-detail-label">Suggestion</span>
                      <span className="issue-detail-value">{issue.suggestion}</span>
                    </div>
                    
                    <div className="issue-actions">
                      <a href={issue.resourceLink} target="_blank" rel="noopener noreferrer" className="issue-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Learn more
                      </a>
                      <a href={issue.guidelineLink} target="_blank" rel="noopener noreferrer" className="issue-action-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        View Guideline
                      </a>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default IssueDisplay;
