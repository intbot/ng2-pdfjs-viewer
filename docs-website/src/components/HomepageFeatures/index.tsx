import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
  icon?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: '🚀 Always Up-to-Date',
    description: (
      <>
        Built on the latest <strong>PDF.js v5.3.93</strong> with continuous updates 
        and <strong>Angular 20+</strong> compatibility. Stay current with modern web standards.
      </>
    ),
  },
  {
    title: '🏗️ Enterprise-Ready',
    description: (
      <>
        Production-tested architecture with comprehensive error handling, 
        performance optimization, and <strong>strict TypeScript</strong> support.
      </>
    ),
  },
  {
    title: '🎨 Highly Customizable',
    description: (
      <>
        Advanced theme system, custom templates, and flexible configuration. 
        Use <strong>Angular templates</strong> for loading and error states.
      </>
    ),
  },
  {
    title: '📱 Mobile Optimized',
    description: (
      <>
        Touch-friendly interface with responsive design for all screen sizes. 
        <strong>Mobile-first</strong> approach ensures great UX everywhere.
      </>
    ),
  },
  {
    title: '⚡ High Performance',
    description: (
      <>
        <strong>Event-driven architecture</strong> with universal action dispatcher. 
        No polling, timeouts, or defensive programming patterns.
      </>
    ),
  },
  {
    title: '🔧 Developer Friendly',
    description: (
      <>
        Complete API coverage, comprehensive documentation, and easy integration. 
        <strong>19+ methods</strong> with consistent Promise-based returns.
      </>
    ),
  },
];

function Feature({title, description, icon}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>
          {title.split(' ')[0]} {/* Extract emoji */}
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title.substring(2)}</Heading> {/* Remove emoji from title */}
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <div className="text--center margin-bottom--xl">
              <Heading as="h2">Why Choose ng2-pdfjs-viewer?</Heading>
              <p className="hero__subtitle">
                The most mature and reliable Angular PDF viewer solution with continuous updates and long-term support
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}