# Vercel Environment Variables Setup

## Required Environment Variables

Add the following environment variable to your Vercel project:

### GITHUB_TOKEN
- **Description**: GitHub personal access token for creating issues
- **Value**: Your GitHub personal access token
- **Required for**: Project submission form
- **Scopes needed**: `repo` (full repository access)

## How to Create GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "ng2-pdfjs-viewer-docs"
4. Select the `repo` scope
5. Click "Generate token"
6. Copy the token and add it to Vercel

## Adding to Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Your GitHub token
   - **Environment**: Production, Preview, Development
4. Click "Save"

## Security Notes

- The token is only used server-side in API routes
- It's not exposed to the client
- Consider using a dedicated GitHub account for this purpose
- Regularly rotate the token for security

## Testing

After adding the environment variable:
1. Redeploy your Vercel project
2. Try submitting a project via the form
3. Check GitHub issues to see if the issue was created
4. Verify the GitHub Action workflow runs successfully
