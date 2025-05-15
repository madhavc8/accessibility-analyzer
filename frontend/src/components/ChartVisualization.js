import React from 'react';
import { Bar } from 'react-chartjs-2';

const ChartVisualization = ({ result, score }) => {
  const chartData = {
    labels: ['Errors', 'Warnings'],
    datasets: [
      {
        label: 'Issue Count',
        data: [
          result ? result.issues.filter(issue => issue.type === 'error').length : 0,
          result ? result.issues.filter(issue => issue.type === 'warning').length : 0,
        ],
        backgroundColor: [
          '#ef4444',
          '#f59e0b'
        ],
        borderWidth: 1
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#1e293b'
        }
      }
    },
    scales: {
      y: {
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

  return (
    <div className="chart-container">
      <h2>Website Score: {score}</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ChartVisualization;
