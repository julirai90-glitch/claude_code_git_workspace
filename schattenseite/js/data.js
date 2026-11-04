// Decoding of the embedded, gzip+base64 data blobs (works from file:// as well as over http).
export async function gunzipB64(b64) {
  const bin = atob(b64), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const stream = new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function loadDem() {
  const m = window.DEM_META, raw = await gunzipB64(window.DEM_B64);
  const d = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
  const z = new Int16Array(d.length);
  for (let r = 0; r < m.rows; r++) { let acc = 0; for (let c = 0; c < m.cols; c++) { const i = r * m.cols + c; acc += d[i]; z[i] = acc; } }
  return { data: z, ...m };
}

export async function loadPlaces() {
  const meta = JSON.parse(new TextDecoder().decode(await gunzipB64(window.PLACES_B64)));
  const raw = await gunzipB64(window.HORIZONS_B64);
  const d = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
  meta.places.forEach((p, k) => {
    const hz = new Float32Array(720); let acc = 0;
    for (let a = 0; a < 720; a++) { acc += d[k * 720 + a]; hz[a] = acc / 100; }
    p.hz = hz; p.kind = p.t === 'hamlet' ? 'Weiler' : p.t === 'town' ? 'Stadt' : 'Dorf';
  });
  return meta;
}
