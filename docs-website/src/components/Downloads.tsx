import { useEffect, useState } from 'react';

// Live all-time npm downloads from api/downloads.ts. The fallback is what the static
// render, crawlers and local dev show; scripts/downloads-milestone.mjs bumps it each million.
const FALLBACK = '9M+';

export default function Downloads() {
  const [label, setLabel] = useState(FALLBACK);
  useEffect(() => {
    fetch('/api/downloads')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.message && setLabel(d.message))
      .catch(() => {});
  }, []);
  return <>{label}</>;
}
