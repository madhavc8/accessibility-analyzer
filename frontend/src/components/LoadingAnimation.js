import React, { useState, useEffect } from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Scanning website...');
  
  // Array of loading messages to cycle through
  const loadingMessages = [
    'Scanning website...',
    'Checking accessibility standards...',
    'Analyzing HTML structure...',
    'Evaluating color contrast...',
    'Examining keyboard navigation...',
    'Inspecting ARIA attributes...',
    'Checking image alt texts...',
    'Validating form controls...',
    'Almost there...'
  ];

  // Update progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        // Increment progress, but slow down as we approach 100%
        // This creates the illusion that we're waiting for the actual response
        const newProgress = prevProgress + (100 - prevProgress) / 20;
        return newProgress > 95 ? 95 : newProgress; // Cap at 95% until actual completion
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Cycle through loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setLoadingText(prevText => {
        const currentIndex = loadingMessages.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(messageInterval);
  }, [loadingMessages]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="scanner-animation">
          <div className="website-mockup">
            <div className="mockup-header"></div>
            <div className="mockup-nav"></div>
            <div className="mockup-content">
              <div className="mockup-text-line"></div>
              <div className="mockup-text-line"></div>
              <div className="mockup-text-line"></div>
              <div className="mockup-image"></div>
              <div className="mockup-text-line"></div>
              <div className="mockup-text-line"></div>
            </div>
          </div>
          <div className="scan-line"></div>
          <div className="accessibility-icons">
            <span className="icon" aria-hidden="true">♿</span>
            <span className="icon" aria-hidden="true">👁️</span>
            <span className="icon" aria-hidden="true">🔍</span>
            <span className="icon" aria-hidden="true">⌨️</span>
          </div>
        </div>
        
        <div className="loading-text">{loadingText}</div>
        
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="loading-tips">
          <h4>Did you know?</h4>
          <p>{getRandomTip()}</p>
        </div>
      </div>
    </div>
  );
};

// Function to get a random accessibility tip
function getRandomTip() {
  const tips = [
    "About 15% of the world's population lives with some form of disability.",
    "WCAG 2.1 has three levels of conformance: A (lowest), AA, and AAA (highest).",
    "Screen readers announce images without alt text as 'image' or ignore them entirely.",
    "Color contrast is essential for users with visual impairments like color blindness.",
    "Keyboard navigation is crucial for users who cannot use a mouse.",
    "Semantic HTML improves accessibility without requiring additional ARIA attributes.",
    "Captions and transcripts make audio and video content accessible to deaf users.",
    "Proper heading structure helps screen reader users navigate your content.",
    "Form labels are essential for screen reader users to understand what information is required.",
    "Animations can trigger vestibular disorders in some users - always provide a way to stop them."
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

export default LoadingAnimation;
