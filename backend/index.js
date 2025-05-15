import express from 'express';
import cors from 'cors';
import pa11y from 'pa11y'; // Assuming you're using pa11y for accessibility testing

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to accept requests from both development and production environments
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://accessibility-analyser.web.app',
    'https://accessibility-analyser.firebaseapp.com'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { url } = req.body;

  try {
    const results = await pa11y(url);

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
    res.status(500).json({ error: 'Failed to analyze the URL' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});