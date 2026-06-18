import styles from './styles.module.css';

type FeatureItem = {
  icon: string;
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    icon: '🧩',
    title: 'One component, the whole toolkit',
    description: (
      <>
        View, annotate, e-sign, fill forms, search, read aloud, and reorganize pages — all from a
        single <code>&lt;ng2-pdfjs-viewer&gt;</code> tag. No separate plugins to wire together.
      </>
    ),
  },
  {
    icon: '📦',
    title: 'Zero runtime dependencies',
    description: (
      <>
        Angular is the only peer dependency. Nothing else is added to your supply chain — the
        rendering engine ships inside the package, not as a transitive npm tree.
      </>
    ),
  },
  {
    icon: '🟢',
    title: 'Current by design',
    description: (
      <>
        Built on <strong>PDF.js 6.0.227</strong> and verified on <strong>Angular 22</strong>, with a
        wide <code>&gt;=10</code> peer range so existing apps upgrade without churn.
      </>
    ),
  },
  {
    icon: '🎛️',
    title: 'Declarative & fully typed',
    description: (
      <>
        40+ <code>@Input()</code>s and 19 <code>@Output()</code>s drive every feature. No iframe
        plumbing, no <code>postMessage</code> wiring — just bindings and events.
      </>
    ),
  },
  {
    icon: '🤖',
    title: 'Bring your own AI',
    description: (
      <>
        Point the assistant at any OpenAI-compatible endpoint — OpenAI, Azure, Ollama, vLLM. The
        library never calls an AI service on its own.
      </>
    ),
  },
  {
    icon: '🛡️',
    title: 'Secure & accountable',
    description: (
      <>
        A same-origin sandboxed iframe, an origin-checked host bridge, npm provenance, and a public
        OpenSSF Scorecard — security you can verify, not just claim.
      </>
    ),
  },
];

function Feature({icon, title, description}: FeatureItem) {
  return (
    <div className={styles.card}>
      <span className={styles.cardIcon}>{icon}</span>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className={styles.inner}>
        <p className={styles.kicker}>Why teams choose it</p>
        <h2 className={styles.heading}>A production PDF stack, not just a viewer.</h2>
        <div className={styles.grid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
