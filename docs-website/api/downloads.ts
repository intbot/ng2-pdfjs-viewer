import type { VercelRequest, VercelResponse } from '@vercel/node';

// All-time npm downloads for ng2-pdfjs-viewer, in shields.io endpoint format so the README badge
// can read it directly; the docs pages and the playground read `message` from the same response.
// npm's range API returns at most 18 months per call, so this sums 540-day chunks from the first
// publish (6 calls in 2026). scripts/downloads-milestone.mjs imports totalDownloads() too.
const FIRST_PUBLISH = Date.UTC(2018, 2, 29);
const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

export async function totalDownloads(now = Date.now()): Promise<number> {
  const ranges: string[] = [];
  for (let s = FIRST_PUBLISH; s < now; s += 540 * DAY) {
    ranges.push(`${iso(s)}:${iso(Math.min(s + 539 * DAY, now))}`);
  }
  const chunks = await Promise.all(
    ranges.map(async (r) => {
      const res = await fetch(`https://api.npmjs.org/downloads/range/${r}/ng2-pdfjs-viewer`);
      if (!res.ok) throw new Error(`npm returned ${res.status} for ${r}`);
      return (await res.json()) as { downloads: { downloads: number }[] };
    }),
  );
  return chunks.reduce((n, c) => n + c.downloads.reduce((a, d) => a + d.downloads, 0), 0);
}

// Rounds down so the "+" is always true: 9_040_834 -> "9M+", 9_150_000 -> "9.1M+".
export const formatMillions = (n: number) => `${Math.floor(n / 1e5) / 10}M+`;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const total = await totalDownloads();
    // The CDN keeps one copy a day and refreshes it in the background, so npm sees ~1 request/day.
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({
      schemaVersion: 1,
      label: 'total downloads',
      message: formatMillions(total),
      color: '22c55e',
      namedLogo: 'npm',
      total,
      asOf: iso(Date.now()),
    });
  } catch (e) {
    console.error(e);
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ schemaVersion: 1, label: 'total downloads', message: 'unavailable', isError: true });
  }
}
