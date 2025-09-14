import { VercelRequest, VercelResponse } from '@vercel/node';

interface CreateIssueRequest {
  name: string;
  description: string;
  url: string;
  githubUrl?: string;
  category: string;
  industry: string;
  featuresUsed: string[];
  versionUsed: string;
  developerName: string;
  email: string;
  companyName?: string;
  twitterHandle?: string;
  linkedinProfile?: string;
  additionalNotes?: string;
  turnstileToken: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const formData: CreateIssueRequest = req.body;

  if (!formData.name || !formData.description || !formData.url) {
    return res.status(400).json({ message: 'Name, description, and URL are required' });
  }

  if (!formData.turnstileToken) {
    return res.status(400).json({ message: 'Turnstile verification is required' });
  }

  try {
    // Verify Turnstile token
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: formData.turnstileToken,
        remoteip: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || ''
      })
    });

    const turnstileResult = await turnstileResponse.json();
    
    if (!turnstileResult.success) {
      console.error('Turnstile verification failed:', turnstileResult);
      return res.status(400).json({ message: 'Verification failed. Please try again.' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      console.error('GITHUB_TOKEN environment variable is not set');
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    // Format the issue body
    const issueBody = `# Project Submission: ${formData.name}

## Project Information
- **Name**: ${formData.name}
- **Description**: ${formData.description}
- **Live URL**: ${formData.url}
- **GitHub Repository**: ${formData.githubUrl || 'Not provided'}
- **Category**: ${formData.category}
- **Industry**: ${formData.industry}

## Technical Details
- **ng2-pdfjs-viewer Version**: ${formData.versionUsed}
- **Features Used**: ${formData.featuresUsed.join(', ')}

## Developer Information
- **Name**: ${formData.developerName}
- **Email**: ${formData.email || 'Not provided'}
- **Company**: ${formData.companyName || 'Not provided'}
- **Twitter**: ${formData.twitterHandle || 'Not provided'}
- **LinkedIn**: ${formData.linkedinProfile || 'Not provided'}

## Additional Notes
${formData.additionalNotes || 'No additional notes provided'}

---
*This issue was automatically created from a project submission form.*`;

    const response = await fetch('https://api.github.com/repos/intbot/ng2-pdfjs-viewer/issues', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ng2-pdfjs-viewer-docs'
      },
      body: JSON.stringify({
        title: `Showcase Submission: ${formData.name}`,
        body: issueBody,
        labels: ['showcase', 'submission']
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      return res.status(response.status).json({ 
        message: 'Failed to create GitHub issue',
        error: errorData.message || 'Unknown error'
      });
    }

    const issueData = await response.json();
    
    return res.status(200).json({
      success: true,
      issueNumber: issueData.number,
      issueUrl: issueData.html_url,
      message: 'Project submitted successfully'
    });

  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
