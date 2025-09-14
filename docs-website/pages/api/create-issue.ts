import { NextApiRequest, NextApiResponse } from 'next';

interface CreateIssueRequest {
  title: string;
  body: string;
  labels: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { title, body, labels }: CreateIssueRequest = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      console.error('GITHUB_TOKEN environment variable is not set');
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    const response = await fetch('https://api.github.com/repos/intbot/ng2-pdfjs-viewer/issues', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'ng2-pdfjs-viewer-docs'
      },
      body: JSON.stringify({
        title,
        body,
        labels: [...labels, 'showcase-submission']
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
