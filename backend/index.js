import express from 'express';
import cors from 'cors';
import pa11y from 'pa11y';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to accept requests from both development and production environments
app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Root route handler
app.get('/', (req, res) => {
  res.json({ message: 'Accessibility Analyzer API is running' });
});

app.post('/analyze', async (req, res) => {
  const { url } = req.body;

  console.log('Received request to analyze URL:', url);
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let browser = null;
  
  try {
    console.log('Launching browser...');
    
    // Setup browser for serverless environment
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });
    
    console.log('Browser launched successfully');
    console.log('Starting pa11y analysis...');
    
    // Add options to pa11y for better compatibility with Vercel serverless environment
    const results = await pa11y(url, {
      browser: browser,
      timeout: 30000, // Increase timeout to 30 seconds
      wait: 1000,    // Wait 1 second after page load
      log: {
        debug: console.log,
        error: console.error,
        info: console.log
      }
    });

    console.log('Pa11y analysis completed successfully');
    
    // Construct the issues array based on the results from pa11y
    const issues = results.issues.map(issue => ({
      type: issue.type, // 'error' or 'warning'
      message: issue.message,
      code: issue.code,
      selector: issue.selector,
      context: issue.context,
      description: 'Images should have an alt attribute for accessibility.', // Example description
      suggestion: 'Add an alt attribute to the image.', // Example suggestion
      resourceLink: 'https://www.w3.org/WAI/WCAG21/quickref/#images', // Example resource link
      guidelineLink: 'https://www.w3.org/WAI/WCAG21/quickref/#images' // Ensure this is set correctly
    }));

    res.json({ issues });
  } catch (error) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({ 
      error: 'Failed to analyze the URL', 
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Close the browser if it was opened
    if (browser !== null) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (err) {
        console.error('Error closing browser:', err);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});