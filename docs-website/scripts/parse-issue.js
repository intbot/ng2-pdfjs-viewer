#!/usr/bin/env node

/**
 * Parse GitHub issue body and extract project information
 * Usage: node parse-issue.js "<issue-body>"
 */

function extractField(text, startLabel, endLabel) {
  const startIndex = text.indexOf(startLabel);
  if (startIndex === -1) return '';
  
  const endIndex = text.indexOf(endLabel, startIndex);
  const start = startIndex + startLabel.length;
  const end = endIndex === -1 ? text.length : endIndex;
  
  return text.substring(start, end).trim();
}

function parseIssueBody(issueBody) {
  const project = {};
  
  // Extract basic project information
  project.name = extractField(issueBody, '**Name:**', '**Description:**');
  project.description = extractField(issueBody, '**Description:**', '**URL:**');
  project.url = extractField(issueBody, '**URL:**', '**GitHub URL:**');
  project.githubUrl = extractField(issueBody, '**GitHub URL:**', '**Category:**');
  project.category = extractField(issueBody, '**Category:**', '**Industry:**');
  project.industry = extractField(issueBody, '**Industry:**', '**Tech Stack:**');
  
  // Parse tech stack (comma-separated)
  const techStackStr = extractField(issueBody, '**Tech Stack:**', '**Features Used:**');
  project.techStack = techStackStr ? techStackStr.split(',').map(s => s.trim()).filter(s => s) : [];
  
  // Parse features used (comma-separated)
  const featuresStr = extractField(issueBody, '**Features Used:**', '**Version:**');
  project.featuresUsed = featuresStr ? featuresStr.split(',').map(s => s.trim()).filter(s => s) : [];
  
  project.versionUsed = extractField(issueBody, '**Version:**', '## Contact');
  
  // Extract contact information
  project.developerName = extractField(issueBody, '**Developer:**', '**Email:**');
  project.email = extractField(issueBody, '**Email:**', '**Company:**');
  project.companyName = extractField(issueBody, '**Company:**', '**Twitter:**');
  project.twitterHandle = extractField(issueBody, '**Twitter:**', '**LinkedIn:**');
  project.linkedinProfile = extractField(issueBody, '**LinkedIn:**', '## Screenshots');
  
  // Extract screenshot URL if present
  const screenshotMatch = issueBody.match(/!\[.*?\]\((.*?)\)/);
  project.screenshot = screenshotMatch ? screenshotMatch[1] : null;
  
  // Extract additional notes
  project.additionalNotes = extractField(issueBody, '## Additional Notes', '---');
  
  // Add metadata
  project.id = Date.now().toString();
  project.submittedAt = new Date().toISOString();
  project.approvedAt = new Date().toISOString();
  project.status = 'approved';
  
  return project;
}

function validateProject(project) {
  const required = ['name', 'description', 'url', 'category', 'developerName', 'email'];
  const missing = required.filter(field => !project[field] || project[field].trim() === '');
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate URL format
  try {
    new URL(project.url);
  } catch (e) {
    throw new Error('Invalid URL format');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(project.email)) {
    throw new Error('Invalid email format');
  }
  
  return true;
}

// Main execution
if (require.main === module) {
  const issueBody = process.argv[2];
  
  if (!issueBody) {
    console.error('Error: Issue body is required');
    process.exit(1);
  }
  
  try {
    const project = parseIssueBody(issueBody);
    validateProject(project);
    
    // Output as JSON for GitHub Actions
    console.log(JSON.stringify(project, null, 2));
  } catch (error) {
    console.error('Error parsing issue:', error.message);
    process.exit(1);
  }
}

module.exports = { parseIssueBody, validateProject };
