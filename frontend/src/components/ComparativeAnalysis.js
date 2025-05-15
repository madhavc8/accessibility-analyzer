import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth } from '../firebase';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './ComparativeAnalysis.css';

// Register the required chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const db = getFirestore();

const ComparativeAnalysis = () => {
  const [userAnalyses, setUserAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  // Fetch user's analysis history
  useEffect(() => {
    const fetchUserHistory = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

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
        
        setUserAnalyses(history);
        setError(null);
      } catch (err) {
        console.error('Error fetching user history:', err);
        setError('Failed to load your analysis history');
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, []);

  // Handle analysis selection for comparison
  const handleAnalysisSelection = (analysisId) => {
    setSelectedAnalyses(prev => {
      // If already selected, remove it
      if (prev.includes(analysisId)) {
        return prev.filter(id => id !== analysisId);
      }
      
      // If we already have 3 items selected, remove the oldest one
      if (prev.length >= 3) {
        return [...prev.slice(1), analysisId];
      }
      
      // Otherwise add it
      return [...prev, analysisId];
    });
  };

  // Generate comparison data when selected analyses change
  useEffect(() => {
    if (selectedAnalyses.length === 0) {
      setComparisonData(null);
      return;
    }

    const selectedData = userAnalyses.filter(analysis => selectedAnalyses.includes(analysis.id));
    
    // Sort by timestamp
    selectedData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Generate labels (truncated URLs)
    const labels = selectedData.map(analysis => {
      const url = new URL(analysis.url);
      return url.hostname + (url.pathname !== '/' ? url.pathname.substring(0, 15) + '...' : '');
    });
    
    // Generate chart data
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Score',
          data: selectedData.map(analysis => analysis.score),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Errors',
          data: selectedData.map(analysis => analysis.errorCount),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        },
        {
          label: 'Warnings',
          data: selectedData.map(analysis => analysis.warningCount),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };
    
    // Chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#1e293b'
          }
        },
        title: {
          display: true,
          text: 'Comparative Analysis',
          color: '#1e293b',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const index = context[0].dataIndex;
              return selectedData[index].url;
            },
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed.y;
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#64748b'
          },
          grid: {
            color: '#e2e8f0'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Score',
            color: '#3b82f6'
          },
          min: 0,
          max: 100,
          ticks: {
            color: '#64748b'
          },
          grid: {
            color: '#e2e8f0'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Issues Count',
            color: '#ef4444'
          },
          min: 0,
          ticks: {
            color: '#64748b'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };
    
    setComparisonData({ chartData, chartOptions, selectedData });
  }, [selectedAnalyses, userAnalyses]);

  if (!auth.currentUser) {
    return (
      <div className="comparative-container">
        <h2>Comparative Analysis</h2>
        <p className="login-message">Please log in to use the comparative analysis feature.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="comparative-container">
        <h2>Comparative Analysis</h2>
        <div className="loading-message">Loading your analysis history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparative-container">
        <h2>Comparative Analysis</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (userAnalyses.length === 0) {
    return (
      <div className="comparative-container">
        <h2>Comparative Analysis</h2>
        <div className="no-data-message">You haven't performed any analyses yet. Run some analyses to enable comparison.</div>
      </div>
    );
  }

  return (
    <div className="comparative-container">
      <h2>Comparative Analysis</h2>
      <p className="instruction">Select up to 3 analyses to compare. Click on an analysis to select/deselect it.</p>
      
      <div className="analysis-selection">
        {userAnalyses.map((analysis) => (
          <div 
            key={analysis.id} 
            className={`analysis-item ${selectedAnalyses.includes(analysis.id) ? 'selected' : ''}`}
            onClick={() => handleAnalysisSelection(analysis.id)}
          >
            <div className="analysis-url">{analysis.url}</div>
            <div className="analysis-meta">
              <span className="analysis-date">
                {analysis.timestamp ? new Date(analysis.timestamp).toLocaleDateString() : 'Unknown date'}
              </span>
              <span className="analysis-score">Score: {analysis.score}</span>
            </div>
          </div>
        ))}
      </div>
      
      {comparisonData && (
        <div className="comparison-results">
          <div className="chart-wrapper">
            <Bar data={comparisonData.chartData} options={comparisonData.chartOptions} height={300} />
          </div>
          
          <div className="comparison-insights">
            <h3>Comparison Insights</h3>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Website</th>
                  <th>Score</th>
                  <th>Errors</th>
                  <th>Warnings</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.selectedData.map(analysis => (
                  <tr key={analysis.id}>
                    <td className="url-cell">{analysis.url}</td>
                    <td className="score-cell">{analysis.score}</td>
                    <td className="error-cell">{analysis.errorCount}</td>
                    <td className="warning-cell">{analysis.warningCount}</td>
                    <td className="date-cell">
                      {analysis.timestamp ? new Date(analysis.timestamp).toLocaleDateString() : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {comparisonData.selectedData.length > 1 && (
              <div className="improvement-analysis">
                <h4>Improvement Analysis</h4>
                {comparisonData.selectedData.length === 2 ? (
                  <p>
                    {(() => {
                      const site1 = new URL(comparisonData.selectedData[0].url).hostname;
                      const site2 = new URL(comparisonData.selectedData[1].url).hostname;
                      const scoreDiff = comparisonData.selectedData[1].score - comparisonData.selectedData[0].score;
                      
                      if (scoreDiff > 0) {
                        return (
                          <><strong className="positive">{site2}</strong> is better than <strong>{site1}</strong> by <strong className="positive">{scoreDiff} points</strong></>
                        );
                      } else if (scoreDiff < 0) {
                        return (
                          <><strong className="negative">{site1}</strong> is better than <strong>{site2}</strong> by <strong className="negative">{Math.abs(scoreDiff)} points</strong></>
                        );
                      } else {
                        return (
                          <><strong>{site1}</strong> and <strong>{site2}</strong> have the same accessibility score</>
                        );
                      }
                    })()}
                  </p>
                ) : (
                  <p>
                    {(() => {
                      const firstSite = new URL(comparisonData.selectedData[0].url).hostname;
                      const lastSite = new URL(comparisonData.selectedData[comparisonData.selectedData.length - 1].url).hostname;
                      const scoreDiff = comparisonData.selectedData[comparisonData.selectedData.length - 1].score - comparisonData.selectedData[0].score;
                      
                      if (scoreDiff > 0) {
                        return (
                          <>From <strong>{firstSite}</strong> to <strong>{lastSite}</strong>, there was an improvement of <strong className="positive">{scoreDiff} points</strong> over {comparisonData.selectedData.length} analyses</>
                        );
                      } else if (scoreDiff < 0) {
                        return (
                          <>From <strong>{firstSite}</strong> to <strong>{lastSite}</strong>, there was a decrease of <strong className="negative">{Math.abs(scoreDiff)} points</strong> over {comparisonData.selectedData.length} analyses</>
                        );
                      } else {
                        return (
                          <>The accessibility score remained unchanged at <strong>{comparisonData.selectedData[0].score}</strong> across all {comparisonData.selectedData.length} analyses</>
                        );
                      }
                    })()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparativeAnalysis;
