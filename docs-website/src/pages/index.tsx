import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.badges}>
            <img src="https://img.shields.io/npm/v/ng2-pdfjs-viewer?logo=npm&color=blue" alt="NPM Version" />
            <img src="https://img.shields.io/badge/PDF.js%20v5.3.93-latest-green?logo=mozilla" alt="PDF.js Version" />
            <img src="https://img.shields.io/badge/Angular%2020+-supported-red?logo=angular" alt="Angular Support" />
            <img src="https://img.shields.io/npm/dm/ng2-pdfjs-viewer?label=downloads%2Fmonth&color=orange" alt="Monthly Downloads" />
            <img src="https://img.shields.io/badge/total%20downloads-7M+-brightgreen?logo=npm" alt="Total Downloads" />
            <img src="https://img.shields.io/github/stars/intbot/ng2-pdfjs-viewer?logo=github" alt="GitHub Stars" />
          </div>
          <div className={styles.buttons}>
            <Link
              className={styles.heroButton + ' ' + styles['heroButton--secondary']}
              to="/docs/getting-started">
              Get Started - 5min ⏱️
            </Link>
            <Link
              className={styles.heroButton + ' ' + styles['heroButton--primary']}
              href="https://angular-pdf-viewer-demo.vercel.app/"
              target="_blank">
              Live Demo 🚀
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Angular PDF Viewer`}
      description="The most comprehensive Angular PDF viewer powered by Mozilla PDF.js. 7M+ downloads, mobile-first, production-ready with complete rewrite in v25.x">
      <HomepageHeader />
      <main>
        <section className={styles.whyRewrite}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className={styles.rewriteContent}>
                  <Heading as="h2" className={styles.rewriteTitle}>Complete Rewrite in v25.x 🎉</Heading>
                  <p className={styles.rewriteDescription}>
                    We completely rewrote ng2-pdfjs-viewer from the ground up with modern Angular patterns, 
                    strict TypeScript, and PDF.js v5.x integration. The result? A more reliable, 
                    feature-rich, and maintainable library.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <HomepageFeatures />
        <section className={styles.showcase}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className={styles.showcaseContent}>
                  <Heading as="h2" className={styles.showcaseTitle}>Trusted by Millions</Heading>
                  <p className={styles.showcaseDescription}>
                    <strong>Born in 2018</strong> and still going strong with over <strong>7+ million downloads</strong>. 
                    This battle-tested library has been trusted by developers worldwide for over <strong>8 years</strong>, 
                    powering thousands of applications.
                  </p>
                  <div className={styles.showcaseButtons}>
                    <a href="/showcase" className={styles.showcaseButton + ' ' + styles['showcaseButton--primary']}>
                      View Projects
                    </a>
                    <a href="/showcase/submit" className={styles.showcaseButton + ' ' + styles['showcaseButton--secondary']}>
                      Submit Your Project
                    </a>
                  </div>
                  <div 
                    className={styles.showcaseImage}
                    onClick={() => window.open('https://angular-pdf-viewer-demo.vercel.app/', '_blank')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.open('https://angular-pdf-viewer-demo.vercel.app/', '_blank');
                      }
                    }}
                  >
                    <img 
                      src="/img/ng2-pdfjs-viewer-screenshot.jpg" 
                      alt="ng2-pdfjs-viewer in action - showing PDF viewer with sidebar, toolbar, and event feed" 
                    />
                  </div>
                  <p className={styles.showcaseCaption}>
                    <em>Live example showing ng2-pdfjs-viewer with full functionality including sidebar navigation, toolbar controls, and real-time event feed</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}