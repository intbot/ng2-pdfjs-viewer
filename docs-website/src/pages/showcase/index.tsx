import React, { useState } from 'react';
import Layout from '@theme/Layout';
import projectsData from '@site/data/projects.json';
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
  accent?: string;
  flag?: string;
  country?: string;
  screenshot?: string;
  logo?: string;
  submittedAt: string;
  approvedAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

const DEPENDENTS_URL = 'https://github.com/intbot/ng2-pdfjs-viewer/network/dependents';

const monogram = (name: string) =>
  name.replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// Flag emoji → ISO 3166 alpha-2 (regional-indicator pair → letters), for flagcdn images.
// Returns '' for anything that isn't a flag emoji, so the caller can skip rendering.
const flagToCC = (flag?: string): string => {
  if (!flag) return '';
  const cps = [...flag].map((c) => c.codePointAt(0) || 0);
  if (!cps.length || cps.some((cp) => cp < 0x1f1e6 || cp > 0x1f1ff)) return '';
  return cps.map((cp) => String.fromCharCode(cp - 0x1f1e6 + 97)).join('');
};

export default function Showcase() {
  const [filter, setFilter] = useState('all');

  // projects.json is bundled at build time (a runtime fetch of /data/ 404s — it isn't a static asset).
  const projects = (projectsData as unknown as Project[]).filter((p) => p.status === 'approved');
  const industries = ['all', ...Array.from(new Set(projects.map((p) => p.industry)))];
  const countryCount = new Set(projects.map((p) => p.country).filter(Boolean)).size;
  const shown = filter === 'all' ? projects : projects.filter((p) => p.industry === filter);

  return (
    <Layout
      title="Showcase"
      description="Production apps and open-source projects built with ng2-pdfjs-viewer — from national agencies to AI tools."
    >
      <div className={styles.page}>
        <div className={styles.mesh} />
        <div className={styles.inner}>
          <span className={styles.eyebrow}>
            <span className={styles.live} /> built with ng2-pdfjs-viewer
          </span>
          <h1 className={styles.title}>
            Teams shipping PDFs <em>in Angular</em>
          </h1>
          <p className={styles.sub}>
            From a national data-protection authority to AI apps — real software running the viewer
            in production. Curated from public usage; add yours below.
          </p>

          {projects.length > 0 && (
            <div className={styles.stats}>
              <div>
                <b>{projects.length}</b>
                <span>projects</span>
              </div>
              <div>
                <b>{new Set(projects.map((p) => p.industry)).size}</b>
                <span>industries</span>
              </div>
              <div>
                <b>{countryCount}</b>
                <span>countries</span>
              </div>
              <div>
                <b>8.3M+</b>
                <span>downloads</span>
              </div>
            </div>
          )}

          {industries.length > 1 && (
            <div className={styles.filters}>
              {industries.map((ind) => (
                <button
                  key={ind}
                  className={`${styles.pill} ${filter === ind ? styles.pillActive : ''}`}
                  onClick={() => setFilter(ind)}
                >
                  {ind === 'all' ? 'All' : ind}
                </button>
              ))}
            </div>
          )}

          {shown.length === 0 ? (
            <p className={styles.empty}>No projects in this category yet.</p>
          ) : (
            <div className={styles.grid}>
              {shown.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  {p.screenshot ? (
                    <img className={styles.shot} src={p.screenshot} alt={`${p.name} screenshot`} loading="lazy" />
                  ) : (
                    <div className={styles.shotLogo}>
                      <div
                        className={styles.mono}
                        style={{ background: `linear-gradient(135deg, ${p.accent || '#7c5cff'}, ${(p.accent || '#7c5cff')}bb)` }}
                      >
                        {monogram(p.name)}
                      </div>
                    </div>
                  )}
                  <div className={styles.body}>
                    <div className={styles.name}>
                      <span className={styles.dot} style={{ background: p.accent || '#7c5cff' }} />
                      {p.name}
                      {flagToCC(p.flag) && (
                        <img className={styles.flag} src={`https://flagcdn.com/20x15/${flagToCC(p.flag)}.png`} width={20} height={15} alt="" loading="lazy" />
                      )}
                    </div>
                    <div className={styles.desc}>{p.description}</div>
                    <div className={styles.meta}>
                      <span className={styles.tag}>{p.techStack.slice(0, 2).join(' · ')}</span>
                      <span className={styles.metaLink}>v{p.versionUsed} ↗</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className={styles.cta}>
            <h2>Shipped something with it?</h2>
            <p>Add your project — send the URL, we'll do the rest.</p>
            <div className={styles.btnRow}>
              <a href="/showcase/submit" className={`${styles.btn} ${styles.btnP}`}>
                Add your project →
              </a>
              <a
                href={DEPENDENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnG}`}
              >
                Browse all dependents on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
