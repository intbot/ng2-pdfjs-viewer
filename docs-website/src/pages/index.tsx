import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './home.module.css';

// The interactive playground (the Angular app). Deep-links use hash routes.
const PLAYGROUND = 'https://angular-pdf-viewer-demo.vercel.app/';
const feat = (route: string) => `${PLAYGROUND}#/${route}`;

function Hero() {
  return (
    <section className={styles.landing}>
      <div className={styles.mesh} />
      <div className={styles.inner}>
        <div className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.live} /> 8.3M+ downloads · since 2018 · Angular 10–22
            </span>
            <h1 className={styles.title}>
              The Angular PDF viewer,<br />
              <em>finally</em> fun to explore.
            </h1>
            <p className={styles.sub}>
              40+ inputs, 19 events, zero runtime dependencies. Flip a control, watch the real{' '}
              <code>&lt;ng2-pdfjs-viewer&gt;</code> react, and copy the exact code — or open it live in StackBlitz.
            </p>
            <div className={styles.ctaRow}>
              <Link className={styles.btnP} to={feat('navigation')}>Launch the playground →</Link>
              <Link className={styles.btnG} to="/docs/getting-started">Read the docs</Link>
            </div>
            <div className={styles.stats}>
              <div><b>40+</b><span>inputs</span></div>
              <div><b>19</b><span>events</span></div>
              <div><b>0</b><span>runtime deps</span></div>
              <div><b>v10–22</b><span>Angular</span></div>
            </div>
          </div>

          <div className={styles.stage}>
            <div className={styles.card3d}>
              <div className={styles.vt}>
                <span className={styles.tb} /><span className={styles.tb} />
                <span className={styles.chip}>3 / 14</span>
                <span className={styles.grow} />
                <span className={styles.chip}>125%</span><span className={styles.chip}>dark</span>
              </div>
              <div className={styles.vbody}>
                <div className={styles.sheet}>
                  <h4>Trace-based JIT Type Specialization</h4>
                  <div className={styles.sheetSub}>A. Gal, B. Eich, M. Shaver — PLDI '09</div>
                  <div className={`${styles.ln} ${styles.lnM}`} /><div className={styles.ln} />
                  <div className={`${styles.ln} ${styles.lnS}`} /><div className={styles.ln} />
                  <div className={`${styles.ln} ${styles.lnM}`} /><div className={styles.ln} />
                  <div className={`${styles.ln} ${styles.lnS}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bentoWrap}>
          <p className={styles.sectionLabel}>Explore by feature group</p>
          <div className={styles.bento}>
            <Link className={`${styles.tile} ${styles.lg}`} to={feat('navigation')}>
              <span className={styles.ic}>⤢</span>
              <h3>Navigation &amp; View Modes</h3>
              <p>Page, zoom, cursor, scroll, spread, page mode &amp; rotation — all two-way bound, all live.</p>
            </Link>
            <Link className={`${styles.tile} ${styles.wide}`} to={feat('theming')}>
              <span className={styles.ic}>◑</span>
              <h3>Theming &amp; Appearance</h3>
              <p>Light / dark / auto, brand colors, radius, custom CSS — recolors instantly.</p>
            </Link>
            <Link className={styles.tile} to={feat('toolbar')}>
              <span className={styles.ic}>▦</span><h3>Toolbar</h3><p>Toggle every button.</p>
            </Link>
            <Link className={styles.tile} to={feat('sources')}>
              <span className={styles.ic}>⛁</span><h3>PDF Sources</h3><p>URL · Blob · bytes · upload.</p>
            </Link>
            <Link className={styles.tile} to={feat('events')}>
              <span className={styles.ic}>⚡</span><h3>Events</h3><p>Live feed of all 19.</p>
            </Link>
            <Link className={`${styles.tile} ${styles.wide}`} to={feat('errors')}>
              <span className={styles.ic}>⚙</span>
              <h3>Auto Actions, Loading &amp; Errors</h3>
              <p>Auto-print/download, custom spinners, error templates &amp; URL validation.</p>
            </Link>
            <Link className={styles.tile} to={feat('localization')}>
              <span className={styles.ic}>⌘</span><h3>Localization</h3><p>Switch the locale.</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Angular PDF Viewer`}
      description="The most comprehensive Angular PDF viewer powered by Mozilla PDF.js. 8.3M+ downloads, mobile-first, production-ready.">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Hero />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
