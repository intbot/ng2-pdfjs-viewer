import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './showcase.module.css';

interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  githubUrl?: string;
  category: string;
  industry: string;
  techStack: string[];
  featuresUsed: string[];
  versionUsed: string;
  developerName: string;
  companyName?: string;
  twitterHandle?: string;
  linkedinProfile?: string;
  screenshot?: string;
  logo?: string;
  submittedAt: string;
  approvedAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

const CATEGORIES = [
  'all',
  'enterprise',
  'startup', 
  'open-source',
  'personal',
  'educational'
];

const INDUSTRIES = [
  'all',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Government',
  'Technology',
  'Media',
  'Legal',
  'Real Estate',
  'Other'
];

export default function Showcase() {
  const { siteConfig } = useDocusaurusContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, selectedCategory, selectedIndustry, searchTerm]);

  const loadProjects = async () => {
    try {
      // Load projects from the data file
      const response = await fetch('/data/projects.json');
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
      } else {
        console.error('Failed to load projects data');
        // Fallback to empty array
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to empty array
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects.filter(project => project.status === 'approved');

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(project => project.industry === selectedIndustry);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.techStack.some(tech => tech.toLowerCase().includes(term)) ||
        project.featuresUsed.some(feature => feature.toLowerCase().includes(term))
      );
    }

    setFilteredProjects(filtered);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      enterprise: '🏢',
      startup: '🚀',
      'open-source': '🔓',
      personal: '👤',
      educational: '🎓'
    };
    return icons[category] || '📁';
  };

  const getIndustryColor = (industry: string) => {
    const colors = {
      'Healthcare': '#e3f2fd',
      'Finance': '#f3e5f5',
      'Education': '#e8f5e8',
      'E-commerce': '#fff3e0',
      'Government': '#fce4ec',
      'Technology': '#e0f2f1',
      'Media': '#f1f8e9',
      'Legal': '#fff8e1',
      'Real Estate': '#e8eaf6',
      'Other': '#f5f5f5'
    };
    return colors[industry] || '#f5f5f5';
  };

  if (loading) {
    return (
      <Layout title="Showcase" description="Projects built with ng2-pdfjs-viewer">
        <div className={styles.showcaseContainer}>
          <div className={styles.loadingSpinner}>Loading projects...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Showcase"
      description="Discover amazing projects built with ng2-pdfjs-viewer"
    >
      <div className={styles.showcaseContainer}>
        {/* Construction Notice */}
        <div className={styles.constructionNotice}>
          <div className={styles.constructionIcon}>🚧</div>
          <div className={styles.constructionContent}>
            <h3 className={styles.constructionTitle}>Showcase Under Construction</h3>
            <p className={styles.constructionDescription}>
              We're currently evaluating submitted projects and they will appear here soon. 
              Thank you for your patience as we curate the best examples for our community!
              <br /><br />
              <strong>Have you built something amazing with ng2-pdfjs-viewer?</strong>
              <br />
              <a href="/showcase/submit" style={{ color: '#d68910', textDecoration: 'underline', fontWeight: '600' }}>
                Submit your project
              </a> and inspire other developers!
              <br /><br />
              <div style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.4' }}>
                <strong>Why submit your project?</strong><br />
                🚀 <strong>Free promotion</strong> - Showcase your work to 7M+ developers<br />
                🔗 <strong>Quality backlinks</strong> - Boost your SEO with high-authority links<br />
                👥 <strong>Community recognition</strong> - Get featured in our official showcase<br />
                💼 <strong>Professional credibility</strong> - Demonstrate your technical skills<br />
                🌟 <strong>Inspire others</strong> - Help fellow developers learn and grow
              </div>
            </p>
          </div>
        </div>

        <div className={styles.showcaseHeader}>
          <h1 className={styles.showcaseTitle}>Projects Built with ng2-pdfjs-viewer</h1>
          <p className={styles.showcaseDescription}>
            Discover amazing applications powered by our library. 
            From enterprise solutions to personal projects, see how developers are using ng2-pdfjs-viewer.
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{projects.length}+</span>
            <span className={styles.statLabel}>Projects</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{new Set(projects.map(p => p.industry)).size}+</span>
            <span className={styles.statLabel}>Industries</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{new Set(projects.map(p => p.developerName)).size}+</span>
            <span className={styles.statLabel}>Developers</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <h3 className={styles.filtersTitle}>Filter Projects</h3>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label htmlFor="category-filter" className={styles.filterLabel}>Category</label>
              <select
                id="category-filter"
                className={styles.filterSelect}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="industry-filter" className={`${styles.filterLabel} ${styles.industryLabel}`}>Industry</label>
              <select
                id="industry-filter"
                className={styles.filterSelect}
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="search" className={`${styles.filterLabel} ${styles.searchLabel}`}>Search</label>
              <input
                type="text"
                id="search"
                className={styles.filterInput}
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className={styles.clearFilters}
              onClick={() => {
                setSelectedCategory('all');
                setSelectedIndustry('all');
                setSearchTerm('');
              }}
            >
              🗑️ Clear Filters
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📁</div>
            <h3 className={styles.emptyStateTitle}>No projects found</h3>
            <p className={styles.emptyStateDescription}>
              Try adjusting your filters or search terms to discover amazing projects.
            </p>
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {filteredProjects.map(project => (
              <div key={project.id} className={styles.projectCard}>
                <h4 className={styles.projectTitle}>{project.name}</h4>
                <p className={styles.projectDescription}>{project.description}</p>
                <div className={styles.projectMeta}>
                  <span className={`${styles.projectBadge} ${styles['projectBadge--category']}`}>
                    {getCategoryIcon(project.category)} {project.category}
                  </span>
                  <span className={`${styles.projectBadge} ${styles['projectBadge--industry']}`}>
                    {project.industry}
                  </span>
                  <span className={`${styles.projectBadge} ${styles['projectBadge--version']}`}>
                    v{project.versionUsed}
                  </span>
                </div>
                <div className={styles.projectLinks}>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className={`${styles.projectLink} ${styles['projectLink--primary']}`}>
                    🌐 View Project
                  </a>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={`${styles.projectLink} ${styles['projectLink--secondary']}`}>
                      💻 GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Built something amazing?</h2>
          <p className={styles.ctaDescription}>
            Share your project with the community and inspire other developers.
          </p>
          <div className={styles.ctaButtons}>
            <a
              href="/showcase/submit"
              className={`${styles.ctaButton} ${styles['ctaButton--primary']}`}
            >
              🚀 Submit Your Project
            </a>
            <a
              href="https://github.com/intbot/ng2-pdfjs-viewer/issues?q=is:issue+label:showcase+is:open"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.ctaButton} ${styles['ctaButton--secondary']}`}
            >
              📋 View All Submissions
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
