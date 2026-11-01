// node render.js w h fps out.mp4  -> rendert alle Frames deterministisch und kodiert H.264
const { open } = require('./snap.js');
const { spawn } = require('child_process');
(async () => {
  const [w, h, fps, out] = process.argv.slice(2);
  const { b, p } = await open(w, h);
  const dur = await p.evaluate(() => window.DURATION);
  const n = Math.ceil(dur * fps);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', fps, '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  const ev = await p.evaluate(() => ({ flips: window.FLIP_EVENTS, pops: window.POP_EVENTS, T: window.T, dur: window.DURATION }));
  require('fs').writeFileSync(out.replace(/\.mp4$/, '_events.json'), JSON.stringify(ev));
  await b.close();
  console.log('done', n, 'frames');
})();
