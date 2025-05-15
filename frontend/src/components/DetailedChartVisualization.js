import React, { useState } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import './DetailedChartVisualization.css';

// Register the required chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DetailedChartVisualization = ({ result, score }) => {
  const [activeChart, setActiveChart] = useState('overview');

  // Extract issue categories
  const getIssueCategories = () => {
    if (!result || !result.issues || result.issues.length === 0) return {};
    
    const categories = {};
    
    result.issues.forEach(issue => {
      // Extract category from the code (e.g., 'aria', 'color-contrast', etc.)
      const category = issue.code.split('-')[0];
      
      if (!categories[category]) {
        categories[category] = {
          errors: 0,
          warnings: 0
        };
      }
      
      if (issue.type === 'error') {
        categories[category].errors++;
      } else if (issue.type === 'warning') {
        categories[category].warnings++;
      }
    });
    
    return categories;
  };

  const issueCategories = getIssueCategories();
  const categoryNames = Object.keys(issueCategories);
  
  // Basic overview chart data
  const overviewChartData = {
    labels: ['Errors', 'Warnings'],
    datasets: [
      {
        label: 'Issue Count',
        data: [
          result ? result.issues.filter(issue => issue.type === 'error').length : 0,
          result ? result.issues.filter(issue => issue.type === 'warning').length : 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 1
      },
    ],
  };
  
  // Category breakdown chart data
  const categoryChartData = {
    labels: categoryNames,
    datasets: [
      {
        label: 'Errors',
        data: categoryNames.map(category => issueCategories[category].errors),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      },
      {
        label: 'Warnings',
        data: categoryNames.map(category => issueCategories[category].warnings),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1
      }
    ],
  };
  
  // Distribution pie chart data
  const distributionChartData = {
    labels: categoryNames,
    datasets: [
      {
        data: categoryNames.map(category => 
          issueCategories[category].errors + issueCategories[category].warnings
        ),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(20, 184, 166, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(20, 184, 166, 1)'
        ],
        borderWidth: 1
      },
    ],
  };
  
  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1e293b',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: activeChart === 'overview' ? 'Overview of Issues' : 'Issues by Category',
        color: '#1e293b',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: '#e2e8f0'
        }
      },
      x: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: '#e2e8f0'
        }
      }
    }
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#1e293b',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Distribution of Issues by Category',
        color: '#1e293b',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  return (
    <div className="detailed-chart-container">
      <div className="chart-controls">
        <button 
          className={`chart-control-btn ${activeChart === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveChart('overview')}
        >
          Overview
        </button>
        <button 
          className={`chart-control-btn ${activeChart === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveChart('categories')}
        >
          Categories
        </button>
        <button 
          className={`chart-control-btn ${activeChart === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveChart('distribution')}
        >
          Distribution
        </button>
      </div>
      
      <div className="chart-display">
        {activeChart === 'overview' && (
          <div className="chart-wrapper">
            <Bar data={overviewChartData} options={barChartOptions} height={300} />
          </div>
        )}
        
        {activeChart === 'categories' && (
          <div className="chart-wrapper">
            <Bar data={categoryChartData} options={barChartOptions} height={300} />
          </div>
        )}
        
        {activeChart === 'distribution' && (
          <div className="chart-wrapper">
            <Doughnut data={distributionChartData} options={pieChartOptions} height={300} />
          </div>
        )}
      </div>
      
      <div className="chart-insights">
        <h3>Key Insights</h3>
        {activeChart === 'overview' && (
          <ul>
            <li>Total issues found: <strong>{result ? result.issues.length : 0}</strong></li>
            <li>Error issues: <strong>{result ? result.issues.filter(issue => issue.type === 'error').length : 0}</strong></li>
            <li>Warning issues: <strong>{result ? result.issues.filter(issue => issue.type === 'warning').length : 0}</strong></li>
            <li>Overall accessibility score: <strong>{score}</strong></li>
          </ul>
        )}
        
        {activeChart === 'categories' && (
          <ul>
            {categoryNames.map(category => (
              <li key={category}>
                <strong>{category}</strong>: {issueCategories[category].errors + issueCategories[category].warnings} issues 
                ({issueCategories[category].errors} errors, {issueCategories[category].warnings} warnings)
              </li>
            ))}
          </ul>
        )}
        
        {activeChart === 'distribution' && (
          <ul>
            {categoryNames.length > 0 ? (
              categoryNames.sort((a, b) => {
                const totalA = issueCategories[a].errors + issueCategories[a].warnings;
                const totalB = issueCategories[b].errors + issueCategories[b].warnings;
                return totalB - totalA; // Sort by most issues first
              }).map(category => (
                <li key={category}>
                  <strong>{category}</strong>: {Math.round((issueCategories[category].errors + issueCategories[category].warnings) / result.issues.length * 100)}% of all issues
                </li>
              ))
            ) : (
              <li>No issues found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DetailedChartVisualization;
