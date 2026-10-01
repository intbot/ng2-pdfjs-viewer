import 'core-js/modules/es.map.get-or-insert-computed';
import 'core-js/modules/es.math.sum-precise';
import 'core-js/modules/es.promise.try';
import 'core-js/modules/es.promise.with-resolvers';
import 'core-js/modules/es.regexp.escape';
import 'core-js/modules/es.uint8-array.from-base64';
import 'core-js/modules/es.uint8-array.to-base64';
import 'core-js/modules/es.uint8-array.to-hex';
import 'core-js/modules/web.url.parse';

// Response/Blob/Request.prototype.bytes() (Chrome 132) has no core-js module.
// Adapted from https://github.com/ungap/bytes; suggested by @delagen in #445.
async function bytes() {
  return new Uint8Array(await this.arrayBuffer());
}
for (const C of ['Blob', 'Request', 'Response']) {
  const p = globalThis[C]?.prototype;
  if (p && !p.bytes) Object.defineProperty(p, 'bytes', { value: bytes, writable: true, configurable: true });
}
