import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './submit.module.css';

interface ProjectSubmission {
  name: string;
  description: string;
  url: string;
  githubUrl: string;
  category: string;
  industry: string;
  techStack: string[];
  featuresUsed: string[];
  versionUsed: string;
  developerName: string;
  email: string;
  companyName: string;
  twitterHandle: string;
  linkedinProfile: string;
  additionalNotes: string;
}

const CATEGORIES = [
  'enterprise',
  'startup', 
  'open-source',
  'personal',
  'educational'
];

const FEATURES = [
  'custom-theming',
  'mobile-optimization', 
  'annotations',
  'text-selection',
  'search',
  'download',
  'print',
  'fullscreen',
  'sidebar',
  'responsive-layout',
  'dark-mode',
  'multi-language',
  'accessibility',
  'custom-toolbar',
  'event-handling'
];

const TECH_STACK_OPTIONS = [
  'Angular',
  'React',
  'Vue.js',
  'Node.js',
  'Express',
  'NestJS',
  'TypeScript',
  'JavaScript',
  'HTML5',
  'CSS3',
  'SCSS',
  'Bootstrap',
  'Material Design',
  'Tailwind CSS',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Firebase',
  'AWS',
  'Azure',
  'Vercel',
  'Netlify',
  'Docker',
  'Kubernetes'
];

export default function SubmitProject() {
  const { siteConfig } = useDocusaurusContext();
  const [formData, setFormData] = useState<ProjectSubmission>({
    name: '',
    description: '',
    url: '',
    githubUrl: '',
    category: '',
    industry: '',
    techStack: [],
    featuresUsed: [],
    versionUsed: '',
    developerName: '',
    email: '',
    companyName: '',
    twitterHandle: '',
    linkedinProfile: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  // Load Turnstile script only in production
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      // In development, set a mock token to bypass validation
      setTurnstileToken('dev-mock-token');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);

    // Set up global callback
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      // Cleanup global callback
      delete (window as any).onTurnstileSuccess;
    };
  }, []);

  const handleInputChange = (field: keyof ProjectSubmission, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: 'techStack' | 'featuresUsed', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const generateIssueBody = (data: ProjectSubmission): string => {
    return `## Project Details
**Name:** ${data.name}
**Description:** ${data.description}
**URL:** ${data.url}
**GitHub URL:** ${data.githubUrl || 'N/A'}
**Category:** ${data.category}
**Industry:** ${data.industry}
**Tech Stack:** ${data.techStack.join(', ')}
**Features Used:** ${data.featuresUsed.join(', ')}
**Version:** ${data.versionUsed}

## Contact
**Developer:** ${data.developerName}
**Email:** ${data.email}
**Company:** ${data.companyName || 'N/A'}
**Twitter:** ${data.twitterHandle || 'N/A'}
**LinkedIn:** ${data.linkedinProfile || 'N/A'}

## Additional Notes
${data.additionalNotes || 'None'}

---
*This submission was created via the showcase submission form.*`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Validate Turnstile token
    if (!turnstileToken) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const issueBody = generateIssueBody(formData);
      
      // Create GitHub issue
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          description: '',
          url: '',
          githubUrl: '',
          category: '',
          industry: '',
          techStack: [],
          featuresUsed: [],
          versionUsed: '',
          developerName: '',
          email: '',
          companyName: '',
          twitterHandle: '',
          linkedinProfile: '',
          additionalNotes: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      title="Submit Your Project"
      description="Share your project built with ng2-pdfjs-viewer with the community"
    >
      <div className={styles.submitContainer}>
        <div className={styles.submitHeader}>
          <h1 className={styles.submitTitle}>Submit Your Project</h1>
          <p className={styles.submitDescription}>
            Share your amazing project built with ng2-pdfjs-viewer and inspire the community!
            Your project will be reviewed and added to our showcase.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.submissionForm}>
          <div className={styles.projectSection}>
            <h3 className={styles.sectionTitle}>Project Information</h3>
                
                <div className="margin-bottom--sm">
                  <label htmlFor="name" className={styles.form__label}>
                    Project Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="e.g., My Awesome PDF App"
                  />
                </div>

                <div className="margin-bottom--sm">
                  <label htmlFor="description" className={styles.form__label}>
                    Description <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="description"
                    className={styles.textarea}
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    placeholder="Brief description of your project and how it uses ng2-pdfjs-viewer"
                  />
                </div>

                <div className="margin-bottom--sm">
                  <label htmlFor="url" className={styles.form__label}>
                    Live URL <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="url"
                    id="url"
                    className={styles.input}
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    required
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="margin-bottom--sm">
                  <label htmlFor="githubUrl" className={styles.form__label}>
                    GitHub Repository (Optional)
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    className={styles.input}
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="row">
                  <div className="col col--6">
                    <div className="margin-bottom--sm">
                  <label htmlFor="category" className={styles.form__label}>
                    Category <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="category"
                    className={styles.select}
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        required
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col col--6">
                    <div className="margin-bottom--sm">
                  <label htmlFor="industry" className={styles.form__label}>
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    className={styles.input}
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        placeholder="e.g., Healthcare, Finance, Education"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.featuresSection} margin-bottom--md`}>
                <h3 className={styles.sectionTitle}>Technical Details</h3>
                
                <div className="margin-bottom--sm">
                  <label className="form__label">
                    Tech Stack (Select all that apply)
                  </label>
                  <div className={styles.checkboxGrid}>
                    {TECH_STACK_OPTIONS.map(tech => (
                      <label key={tech} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={formData.techStack.includes(tech)}
                          onChange={() => handleArrayToggle('techStack', tech)}
                        />
                        <span className="margin-left--xs">{tech}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="margin-bottom--sm">
                  <label className="form__label">
                    Features Used (Select all that apply)
                  </label>
                  <div className={styles.checkboxGrid}>
                    {FEATURES.map(feature => (
                      <label key={feature} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={formData.featuresUsed.includes(feature)}
                          onChange={() => handleArrayToggle('featuresUsed', feature)}
                        />
                        <span>
                          {feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="margin-bottom--sm">
                  <label htmlFor="versionUsed" className={styles.form__label}>
                    ng2-pdfjs-viewer Version Used
                  </label>
                  <input
                    type="text"
                    id="versionUsed"
                    className={`${styles.input} ${styles.versionInput}`}
                    value={formData.versionUsed}
                    onChange={(e) => handleInputChange('versionUsed', e.target.value)}
                    placeholder="e.g., 25.0.12"
                  />
                </div>
              </div>

              <div className={`${styles.contactSection} margin-bottom--md`}>
                <h3 className={styles.sectionTitle}>Contact Information</h3>
                
                <div className="row">
                  <div className="col col--6">
                    <div className="margin-bottom--sm">
                      <label htmlFor="developerName" className={styles.form__label}>
                        Your Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="developerName"
                        className={styles.input}
                        value={formData.developerName}
                        onChange={(e) => handleInputChange('developerName', e.target.value)}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="col col--6">
                    <div className="margin-bottom--sm">
                      <label htmlFor="email" className={styles.form__label}>
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className={styles.input}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="margin-bottom--sm">
                  <label htmlFor="companyName" className={styles.form__label}>
                    Company/Organization (Optional)
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className={styles.input}
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="row">
                  <div className="col col--6">
                    <div className="margin-bottom--sm">
                      <label htmlFor="twitterHandle" className={styles.form__label}>
                        Twitter Handle (Optional)
                      </label>
                      <input
                        type="text"
                        id="twitterHandle"
                        className={styles.input}
                        value={formData.twitterHandle}
                        onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                        placeholder="@johndoe"
                      />
                    </div>
                  </div>
                  <div className="col col--6">
                    <div className="margin-bottom--sm">
                      <label htmlFor="linkedinProfile" className={styles.form__label}>
                        LinkedIn Profile (Optional)
                      </label>
                      <input
                        type="url"
                        id="linkedinProfile"
                        className={styles.input}
                        value={formData.linkedinProfile}
                        onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${styles.additionalSection} margin-bottom--md`}>
                <h3 className={styles.sectionTitle}>Additional Information</h3>
                
                <div className="margin-bottom--sm">
                  <label htmlFor="additionalNotes" className={styles.form__label}>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="additionalNotes"
                    className={styles.textarea}
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any additional information about your project, challenges solved, or special features..."
                  />
                </div>
              </div>

              <div className="text--center">
                {process.env.NODE_ENV === 'production' && (
                  <div className="margin-bottom--md">
                    <div 
                      className="cf-turnstile" 
                      data-sitekey="0x4AAAAAAB1McRqFjezYeGis" 
                      data-callback="onTurnstileSuccess"
                      data-theme="light"
                      style={{ display: 'inline-block' }}
                    ></div>
                  </div>
                )}
                {process.env.NODE_ENV !== 'production' && (
                  <div className="margin-bottom--md">
                    <div style={{ 
                      padding: '1rem', 
                      background: '#e3f2fd', 
                      border: '1px solid #2196f3', 
                      borderRadius: '8px',
                      color: '#1976d2',
                      fontSize: '0.9rem'
                    }}>
                      🔧 Development Mode: Turnstile disabled for local testing
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || !turnstileToken}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Project'}
                </button>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className={`${styles.alert} ${styles['alert--success']}`}>
                  <h4>🎉 Thank you for your submission!</h4>
                  <p>
                    Your project has been submitted for review. We'll get back to you within 1-2 weeks.
                    You can track the status in our <a href="https://github.com/intbot/ng2-pdfjs-viewer/issues?q=is:issue+label:showcase+is:open" target="_blank" rel="noopener noreferrer">GitHub issues</a>.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className={`${styles.alert} ${styles['alert--danger']}`}>
                  <h4>❌ Submission Failed</h4>
                  <p>
                    There was an error submitting your project. Please try again or 
                    <a href="https://github.com/intbot/ng2-pdfjs-viewer/issues/new?template=project-submission.md" target="_blank" rel="noopener noreferrer"> submit directly on GitHub</a>.
                  </p>
                </div>
              )}
            </form>
        </div>
    </Layout>
  );
}
