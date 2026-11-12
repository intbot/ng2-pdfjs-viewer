// Iterator helpers (Safari 18.4): pdf.mjs and the worker touch Iterator.prototype
// at load, so without these Safari < 18.4 can't start the viewer at all (#457).
// Same set Mozilla's legacy build pulls in.
// ArrayBuffer.prototype.transferToFixedLength (Safari 17.4): the worker packs every
// font with it, so without it pages on iOS 17.0-17.3 wait forever for their fonts.
import 'core-js/modules/es.array-buffer.transfer-to-fixed-length';
import 'core-js/modules/es.iterator.constructor';
import 'core-js/modules/es.iterator.drop';
import 'core-js/modules/es.iterator.every';
import 'core-js/modules/es.iterator.filter';
import 'core-js/modules/es.iterator.find';
import 'core-js/modules/es.iterator.flat-map';
import 'core-js/modules/es.iterator.for-each';
import 'core-js/modules/es.iterator.map';
import 'core-js/modules/es.iterator.some';
import 'core-js/modules/es.iterator.take';
import 'core-js/modules/es.iterator.to-array';
import 'core-js/modules/es.map.get-or-insert';
import 'core-js/modules/es.map.get-or-insert-computed';
import 'core-js/modules/es.math.sum-precise';
import 'core-js/modules/es.promise.try';
import 'core-js/modules/es.promise.with-resolvers';
import 'core-js/modules/es.regexp.escape';
import 'core-js/modules/es.uint8-array.from-base64';
import 'core-js/modules/es.uint8-array.set-from-base64';
import 'core-js/modules/es.uint8-array.set-from-hex';
import 'core-js/modules/es.uint8-array.to-base64';
import 'core-js/modules/es.uint8-array.to-hex';
import 'core-js/modules/es.weak-map.get-or-insert';
import 'core-js/modules/es.weak-map.get-or-insert-computed';
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

// AbortSignal.any() (Chrome 116, Safari 17.4) has no core-js module either.
if (globalThis.AbortSignal && !AbortSignal.any) {
  AbortSignal.any = function (signals) {
    const ac = new AbortController();
    for (const signal of signals) {
      if (signal.aborted) {
        ac.abort(signal.reason);
        break;
      }
      signal.addEventListener('abort', () => ac.abort(signal.reason), { once: true, signal: ac.signal });
    }
    return ac.signal;
  };
}

// `for await (... of readableStream)` (getTextContent, decompression) needs
// ReadableStream async iteration, which some Safari releases lack.
const RS = globalThis.ReadableStream?.prototype;
if (RS && !RS[Symbol.asyncIterator]) {
  RS.values = function ({ preventCancel = false } = {}) {
    const reader = this.getReader();
    return {
      async next() {
        const result = await reader.read();
        if (result.done) reader.releaseLock();
        return result;
      },
      async return(value) {
        if (!preventCancel) await reader.cancel(value);
        reader.releaseLock();
        return { done: true, value };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  };
  RS[Symbol.asyncIterator] = RS.values;
}
