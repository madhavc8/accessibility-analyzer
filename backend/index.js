import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import validator from 'html-validator';

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

  try {
    console.log('Fetching HTML from URL...');
    const response = await fetch(url);
    const html = await response.text();
    
    console.log('Analyzing HTML for accessibility issues...');
    
    // Parse HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Collect accessibility issues
    const issues = [];
    
    // Check for images without alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          type: 'error',
          message: 'Image missing alt attribute',
          code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
          selector: `img:nth-of-type(${index + 1})`,
          context: img.outerHTML,
          description: 'Images should have an alt attribute for accessibility.',
          suggestion: 'Add an alt attribute to the image.',
          resourceLink: 'https://www.w3.org/WAI/WCAG21/quickref/#non-text-content',
          guidelineLink: 'https://www.w3.org/WAI/WCAG21/quickref/#non-text-content'
        });
      }
    });
    
    // Check for form inputs without labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const inputId = input.getAttribute('id');
      if (inputId) {
        const hasLabel = document.querySelector(`label[for="${inputId}"]`);
        if (!hasLabel) {
          issues.push({
            type: 'error',
            message: 'Form element has no associated label',
            code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H44',
            selector: `#${inputId}`,
            context: input.outerHTML,
            description: 'Form controls should have associated label elements.',
            suggestion: 'Add a label element with a for attribute matching the input id.',
            resourceLink: 'https://www.w3.org/WAI/WCAG21/quickref/#info-and-relationships',
            guidelineLink: 'https://www.w3.org/WAI/WCAG21/quickref/#info-and-relationships'
          });
        }
      }
    });
    
    // Check for empty headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.textContent.trim()) {
        issues.push({
          type: 'error',
          message: 'Empty heading',
          code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H42',
          selector: `${heading.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          context: heading.outerHTML,
          description: 'Headings should not be empty.',
          suggestion: 'Add content to the heading or remove it.',
          resourceLink: 'https://www.w3.org/WAI/WCAG21/quickref/#info-and-relationships',
          guidelineLink: 'https://www.w3.org/WAI/WCAG21/quickref/#info-and-relationships'
        });
      }
    });
    
    // Check for missing document language
    const html_element = document.querySelector('html');
    if (!html_element.hasAttribute('lang')) {
      issues.push({
        type: 'error',
        message: 'Document language not specified',
        code: 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
        selector: 'html',
        context: html_element.outerHTML.substring(0, 100) + '...',
        description: 'The language of the document should be specified.',
        suggestion: 'Add a lang attribute to the html element.',
        resourceLink: 'https://www.w3.org/WAI/WCAG21/quickref/#language-of-page',
        guidelineLink: 'https://www.w3.org/WAI/WCAG21/quickref/#language-of-page'
      });
    }
    
    // Check for missing page title
    const title = document.querySelector('title');
    if (!title || !title.textContent.trim()) {
      issues.push({
        type: 'error',
        message: 'Page missing title',
        code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.NoTitleEl',
        selector: 'head',
        context: document.querySelector('head').outerHTML.substring(0, 100) + '...',
        description: 'Each page should have a descriptive title.',
        suggestion: 'Add a title element within the head element.',
        resourceLink: 'https://www.w3.org/WAI/WCAG21/quickref/#page-titled',
        guidelineLink: 'https://www.w3.org/WAI/WCAG21/quickref/#page-titled'
      });
    }
    
    console.log(`Analysis complete. Found ${issues.length} issues.`);
    res.json({ issues });
    
  } catch (error) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({ 
      error: 'Failed to analyze the URL', 
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});