// «Wie bündnerisch stimmt Bern?» – renders data/page.json
(async function () {
  const COL = { SVP: 'var(--svp)', SP: 'var(--sp)', FDP: 'var(--fdp)', Mitte: 'var(--mitte)', 'Grüne': 'var(--gruene)', GLP: 'var(--glp)' };
  const CODE = { Y: 'yes', N: 'no', E: 'abstention' };
  const OTHER = { P: 'Vorsitz, stimmt nicht', '-': 'nicht teilgenommen' };
  const WORD = { yes: 'Ja', no: 'Nein', abstention: 'Enthaltung' };
  const pct = (x, d = 0) => (100 * x).toFixed(d).replace('.', ',') + ' %';
  const n = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dmy = s => s.split('-').reverse().join('.');
  const $ = s => document.querySelector(s);

  let D;
  try {
    D = await (await fetch('data/page.json')).json();
  } catch (e) {
    $('#loading').textContent = 'Daten konnten nicht geladen werden.';
    return;
  }
  $('#loading').remove();
  document.querySelectorAll('[data-k]').forEach(el => {
    const v = D.text[el.dataset.k];
    if (v !== undefined) el.textContent = v;
  });

  $('#kb').innerHTML = D.text.kb.map(k => `<div class="kbi"><b>${esc(k.v)}</b><span>${esc(k.l)}</span></div>`).join('');
  const P = D.people;
  const byName = Object.fromEntries(P.map(p => [p.name, p]));
  const last = name => name.split(' ').slice(-1)[0].replace('Martullo-Blocher', 'Martullo');
  const short = name => name.replace('Magdalena ', 'M. ').replace('Martullo-Blocher', 'Martullo');

  // people strip
  $('#people').innerHTML = P.map(p => `
    <div class="person" style="--c:${COL[p.fraction] || '#999'}">
      <b>${esc(p.name)}</b><span>${esc(p.role)} · ${esc(p.fraction)}</span>
      ${p.status ? `<div class="tag out">${esc(p.status)}</div>` : ''}
    </div>`).join('');

  // tooltip
  const tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip);
  const showTip = (el, html) => {
    tip.innerHTML = html; tip.style.opacity = 1; shownAt = Date.now();
    const r = el.getBoundingClientRect();
    const x = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2));
    const y = r.top - tip.offsetHeight - 8 < 0 ? r.bottom + 8 : r.top - tip.offsetHeight - 8;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  };
  let shownAt = 0;
  const hideTip = () => { tip.style.opacity = 0; };
  document.addEventListener('click', e => { if (!e.target.closest('[data-tip]')) hideTip(); });
  window.addEventListener('scroll', () => { if (Date.now() - shownAt > 400) hideTip(); }, { passive: true });

  // matrix
  const nr = P.filter(p => p.council === 'NR');
  const pair = {};
  D.pairs.forEach(q => { pair[q.a + '|' + q.b] = q; pair[q.b + '|' + q.a] = q; });
  const lo = D.text.matrix_min, hi = 1;
  const shade = v => {
    const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
    const l = 95 - t * 62;
    return `hsl(203 ${45 + t * 40}% ${l}%)`;
  };
  $('#matrix').innerHTML = `<thead><tr><th class="row"></th>${nr.map(p => `<th scope="col"><span class="fn">${esc(p.name.split(' ')[0])} </span>${esc(last(p.name))}<br><span class="muted">${esc(p.fraction)}</span></th>`).join('')}</tr></thead>
    <tbody>${nr.map(a => `<tr><th class="row" scope="row">${esc(a.name)}</th>${nr.map(b => {
      if (a === b) return '<td class="self">–</td>';
      const q = pair[a.name + '|' + b.name]; const v = q.same / q.both;
      return `<td tabindex="0" style="background:${shade(v)};color:${v > lo + (hi - lo) * .55 ? '#fff' : 'var(--ink)'}"
        data-tip="<b>${esc(a.name)} – ${esc(b.name)}</b><br>gleich gestimmt in ${n(q.same)} von ${n(q.both)} Abstimmungen, an denen beide teilnahmen">${pct(v)}</td>`;
    }).join('')}</tr>`).join('')}</tbody>`;
  $('#ramp').style.background = `linear-gradient(90deg, ${shade(lo)}, ${shade(hi)})`;
  $('#ramp-lo').textContent = pct(lo); $('#ramp-hi').textContent = pct(hi);
  const bindTips = () => document.querySelectorAll('[data-tip]:not([data-bound])').forEach(el => {
    el.dataset.bound = 1;
    el.addEventListener('mouseenter', () => showTip(el, el.dataset.tip));
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('focus', () => showTip(el, el.dataset.tip));
    el.addEventListener('blur', hideTip);
    el.addEventListener('click', () => showTip(el, el.dataset.tip));
  });
  bindTips();

  // canton cohesion
  const coh = D.cohesion;
  const cmax = Math.max(...coh.map(c => c.agree));
  $('#cohesion').innerHTML = coh.map(c => `
    <div class="bar-row ${c.canton === 'GR' ? 'hi' : ''}">
      <span class="lab">${esc(c.name)} <span class="muted small">(${c.seats})</span></span>
      <span class="track"><span class="fill" style="width:${(100 * c.agree / cmax).toFixed(1)}%"></span></span>
      <span class="val">${pct(c.agree)}</span>
    </div>`).join('');

  // authored businesses table
  const VT = D.vor.types, short2 = { 'Fragestunde. Frage': 'Fragestunde', 'Parlamentarische Initiative': 'Parl. Initiative' };
  $('#vor').innerHTML = `<thead><tr><th scope="col">Person</th>${VT.map(t => `<th scope="col">${esc(short2[t] || t)}</th>`).join('')}<th scope="col">Total</th></tr></thead><tbody>${
    D.order.map(nm => { const r = D.vor.by[nm]; const tot = VT.reduce((a, t) => a + r[t], 0);
      return `<tr><th scope="row">${esc(nm)} <span class="muted small">${byName[nm].council}</span></th>${VT.map(t => `<td>${r[t] || '<span class="muted">–</span>'}</td>`).join('')}<td><b>${tot}</b></td></tr>`; }).join('')}</tbody>`;

  // departing members
  $('#leaving').innerHTML = D.leaving.map(p => `
    <article class="card" style="--c:${COL[p.fraction]}">
      <h3>${esc(p.name)}</h3>
      <div class="role">${esc(p.role)}</div>
      <dl class="kv">
        <dt>Abstimmungen im Rat</dt><dd>${n(p.votings)}</dd>
        ${p.president ? `<dt>davon mit Vorsitz (stimmt nicht)</dt><dd>${n(p.president)}</dd>` : ''}
        <dt>teilgenommen${p.president ? ' (ohne Vorsitz)' : ''}</dt><dd>${pct(p.participated / (p.votings - p.president))}</dd>
        <dt>anders als die eigene Fraktion</dt><dd>${pct(p.deviated / p.fraction_defined, 1)}</dd>
        <dt>auf der Seite der Mehrheit</dt><dd>${pct(p.majority_side / p.yesno_decided)}</dd>
      </dl>
      ${p.vor_list.length ? `<details><summary>Eigene Vorstösse in dieser Legislatur (${p.vor_list.length})</summary><ol>
        ${p.vor_list.map(b => `<li><a href="${esc(b.link)}" target="_blank" rel="noopener">${esc(b.title)}</a> <span class="muted">– ${esc(b.type)} ${esc(b.nr)}, ${esc(b.status)}</span></li>`).join('')}</ol></details>` : ''}
      ${p.dev_list.length ? `<details><summary>Abweichungen von der Fraktion (${n(p.deviated)}) – die jüngsten ${p.dev_list.length}</summary><ol>
        ${p.dev_list.map(v => `<li>${dmy(v.date)}: ${v.link ? `<a href="${esc(v.link)}" target="_blank" rel="noopener">${esc(v.affair)}</a>` : esc(v.affair)} ${v.subject ? ` – <span class="muted">${esc(v.subject)}</span>` : ''}. Stimmte <b>${WORD[v.vote]}</b>, Fraktion mehrheitlich ${WORD[v.fpos]}.</li>`).join('')}
      </ol></details>` : ''}
    </article>`).join('');

  // history
  const hm = Math.max(...D.hist.map(h => h.share));
  $('#hist').innerHTML = D.hist.map(h => `
    <div class="bar-row hist ${h.leg === 52 ? 'hi' : ''}">
      <span class="lab">${h.years}</span>
      <span class="track" data-tip="<b>${h.years}</b><br>alle fünf gleich: ${n(h.closed)} von ${n(h.full)} Abstimmungen mit voller Teilnahme<br>${h.names.map(esc).join(', ')}" tabindex="0"><span class="fill" style="width:${(100 * h.share / hm).toFixed(1)}%"></span></span>
      <span class="val">${pct(h.share)}</span>
    </div>
    <div class="hist-names">${h.names.map(esc).join(' · ')}</div>`).join('');

  bindTips();

  // bridge list (closed across fraction lines)
  const BR = D.votes.filter(v => v[12].includes('b'));
  $('#bridge').innerHTML = BR.map(v => {
    const devs = D.order.filter((nm, i) => v[11][i] === '1');
    const word = { Y: 'Ja', N: 'Nein', E: 'Enthaltung' }[v[10][0]];
    return `<li><span class="d">${dmy(v[2])}</span> ${v[6] ? `<a href="${esc(v[6])}" target="_blank" rel="noopener">${esc(v[4])}</a>` : esc(v[4])}${v[5] ? ` <span class="muted">(${esc(v[5])})</span>` : ''}<br><span class="small">Alle fünf: <b>${word}</b> · gegen die eigene Fraktion: ${devs.map(esc).join(', ')}</span></li>`;
  }).join('');

  // topics
  const dot = (c, nm) => { const w = CODE[c] ? WORD[CODE[c]] : (OTHER[c] || ''); return `<i class="dot ${CODE[c] || (c === 'P' ? 'chair' : '')}" role="img" aria-label="${esc(nm)}: ${w}" title="${esc(nm)}: ${w}"></i>`; };
  $('#topics').innerHTML = D.topics.map(t => `
    <details class="topic"><summary><b>${esc(t.name)}</b> <span class="muted">${t.nr} im Nationalrat · ${t.sr} im Ständerat</span></summary>
      <p class="small muted">Suchbegriffe im Geschäftstitel: ${esc(t.words)}</p>
      <div class="tgrid" role="table">
        <div class="trow th" role="row"><span role="columnheader">Abstimmung</span><span class="tdots" role="columnheader">${D.order.map(nm => `<abbr title="${esc(nm)}">${esc(nm.split(' ').map(w => w[0]).join('').slice(0, 2))}</abbr>`).join('')}</span></div>
        ${t.idx.map(i => { const v = D.votes[i]; return `<div class="trow" role="row"><span role="cell"><span class="muted small">${dmy(v[2])} · ${v[1]}</span><br>${v[6] ? `<a href="${esc(v[6])}" target="_blank" rel="noopener">${esc(v[4])}</a>` : esc(v[4])}${v[5] ? ` <span class="muted small">(${esc(v[5])})</span>` : ''}</span><span class="tdots" role="cell">${[...v[10]].map((c, i) => c === '.' ? '<i class="dot none" aria-hidden="true"></i>' : dot(c, D.order[i])).join('')}</span></div>`; }).join('')}
      </div>
    </details>`).join('');

  // vote browser
  const V = D.votes; // [key, council, date, business, affair, subject, link, yes, no, abst, codes, devmask, flags]
  const order = D.order; // names in code order
  let filter = 'all', q = '', shown = 30;
  const chips = [['all', 'Alle'], ['nr', 'Nationalrat'], ['closed', 'Bündner NR geschlossen'], ['bridge', 'Geschlossen über Fraktionsgrenzen'], ['split', 'Bündner NR gespalten'], ['sr', 'Ständerat']];
  $('#chips').innerHTML = chips.map(([k, l]) => `<button class="chip" data-f="${k}" aria-pressed="${k === filter}">${l}</button>`).join('');
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    filter = b.dataset.f; shown = 30;
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === b));
    render();
  });
  let t;
  $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { q = e.target.value.trim().toLowerCase(); shown = 30; render(); }, 150); });
  $('#sort').addEventListener('change', render);
  $('#more').addEventListener('click', () => { shown += 50; render(); });

  const norm = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function match(v) {
    const f = v[12];
    if (filter === 'closed' && !f.includes('c')) return false;
    if (filter === 'bridge' && !f.includes('b')) return false;
    if (filter === 'split' && !f.includes('s')) return false;
    if (filter === 'sr' && v[1] !== 'SR') return false;
    if (filter === 'nr' && v[1] !== 'NR') return false;
    if (q) {
      const hay = norm(v[3] + ' ' + v[4] + ' ' + v[5]);
      return norm(q).split(/\s+/).every(w => hay.includes(w));
    }
    return true;
  }
  function render() {
    let list = V.filter(match);
    if ($('#sort').value === 'old') list = list.slice().reverse();
    $('#count').textContent = list.length ? `${n(list.length)} Abstimmungen` : 'Keine Abstimmung gefunden. Anderen Suchbegriff versuchen.';
    $('#vlist').innerHTML = list.slice(0, shown).map(v => {
      const people = [...v[10]].map((c, i) => [order[i], c, v[11][i] === '1']).filter(([, c]) => c !== '.');
      return `<li class="vitem">
        <div class="meta"><span>${dmy(v[2])}</span><span>${v[1] === 'NR' ? 'Nationalrat' : 'Ständerat'}</span>${v[3] ? `<span>${esc(v[3])}</span>` : ''}<span>Ja ${v[7]} · Nein ${v[8]} · Enth. ${v[9]}</span></div>
        <div class="t">${v[6] ? `<a href="${esc(v[6])}" target="_blank" rel="noopener">${esc(v[4])}</a>` : esc(v[4])}</div>
        <div class="s">${esc(v[5] || '')}</div>
        <div class="gr">${people.map(([name, c, dev]) => `<span class="vote ${CODE[c] || ''} ${dev ? 'dev' : ''}" title="${dev ? 'anders als die eigene Fraktion' : ''}"><i></i>${esc(short(name))}: ${CODE[c] ? WORD[CODE[c]] : OTHER[c]}</span>`).join('')}</div>
      </li>`;
    }).join('');
    $('#more').hidden = list.length <= shown;
  }
  render();
})();
