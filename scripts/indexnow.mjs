// Tells IndexNow (Bing, Yandex, Seznam, Naver) that the docs site changed, so new and edited pages get
// recrawled in minutes instead of days. Bing's index is also what Copilot and ChatGPT search read from.
// The key isn't a secret: IndexNow checks it against https://angularpdf.com/<key>.txt, which the docs site serves
// from docs-website/static/.
//
// Run by .github/workflows/indexnow.yml after each production deploy of the docs. Locally: node scripts/indexnow.mjs
const HOST = 'angularpdf.com';
const KEY = '74d2509591138e1ee7f909f88815de0c';

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
// ponytail: sends every sitemap URL (a few dozen); send only changed pages if the site grows past a few thousand
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (!urlList.length) throw new Error(`no <loc> entries in https://${HOST}/sitemap.xml`);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
// 200 = accepted, 202 = accepted while the key is still being verified
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}
