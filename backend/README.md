# Accessibility Analyzer Backend

This is the backend service for the Accessibility Analyzer application. It provides an API endpoint for analyzing website accessibility using Pa11y.

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. The server will run on http://localhost:5000

## API Endpoints

### POST /analyze

Analyzes a URL for accessibility issues.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
Returns an array of accessibility issues found on the page.

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: accessibility-analyzer-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. Deploy the service

Once deployed, update the frontend's `.env` file with your Render service URL.
