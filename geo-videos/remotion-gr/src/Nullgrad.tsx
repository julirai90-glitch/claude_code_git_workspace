import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import data from './data.json';

type Row = {year: number; from_: number; z0: number; frac: number; lost: number};
const SERIES = data.series as Row[];
const BOUNDS = data.bounds as [[number, number], [number, number], [number, number], [number, number]];

// timeline (30 fps)
const INTRO = 30;            // first period held
const PER_YEAR = 3;
const RUN = (SERIES.length - 1) * PER_YEAR;
const HOLD = 120;            // last period held
const CREDITS = 90;
export const TOTAL_FRAMES = INTRO + RUN + HOLD + CREDITS;

const MAP_TOP = 520;
const MAP_H = 1020;

const TOWNS: [string, number, number][] = [
  ['Chur', 9.5308, 46.8706], ['Davos', 9.8436, 46.813], ['Samedan', 9.8795, 46.5262], ['Scuol', 10.2833, 46.7933],
  ['Disentis', 8.8535, 46.7066], ['Poschiavo', 10.063, 46.3472], ['Ilanz', 9.2154, 46.775],
];

const C = {ink: '#1c2026', sub: '#4a4f57', cold: '#e8f3ff', lost: '#ff8c3c', bg: '#f6f6f3'};

const periodIndex = (frame: number) =>
  Math.min(SERIES.length - 1, Math.max(0, Math.floor((frame - INTRO) / PER_YEAR)));

const camera = (frame: number) => {
  const u = interpolate(frame, [0, INTRO + RUN + HOLD], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  return {
    center: [9.58 + 0.06 * u, 46.56 + 0.02 * u] as [number, number],
    zoom: 8.55 + 0.22 * u,
    pitch: 48 - 6 * u,
    bearing: -8 + 14 * u,
  };
};

const MapView: React.FC<{frame: number}> = ({frame}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [initHandle] = useState(() => delayRender('map init', {timeoutInMilliseconds: 120000}));

  useEffect(() => {
    if (!ref.current) return;
    const cam = camera(frame);
    const map = new maplibregl.Map({
      container: ref.current,
      style: {
        version: 8,
        sources: {
          dem: {type: 'raster-dem', tiles: [staticFile('terrain') + '/{z}/{x}/{y}.webp'], tileSize: 512, encoding: 'terrarium', minzoom: 5, maxzoom: 11, bounds: [8.3, 45.9, 10.85, 47.3]},
          hs: {type: 'raster-dem', tiles: [staticFile('terrain') + '/{z}/{x}/{y}.webp'], tileSize: 512, encoding: 'terrarium', minzoom: 5, maxzoom: 11, bounds: [8.3, 45.9, 10.85, 47.3]},
          cold: {type: 'image', url: staticFile(`cold/${SERIES[0].year}.png`), coordinates: BOUNDS},
          gr: {type: 'geojson', data: staticFile('gr.geojson')},
        },
        layers: [
          {id: 'bg', type: 'background', paint: {'background-color': '#d9d6cf'}},
          {id: 'hill', type: 'hillshade', source: 'hs', paint: {
            'hillshade-exaggeration': 0.75, 'hillshade-shadow-color': '#5a5650', 'hillshade-highlight-color': '#ffffff',
            'hillshade-accent-color': '#8a857c', 'hillshade-illumination-direction': 315}},
          {id: 'cold', type: 'raster', source: 'cold', paint: {'raster-opacity': 0.92, 'raster-fade-duration': 0, 'raster-resampling': 'linear'}},
          {id: 'gr-halo', type: 'line', source: 'gr', paint: {'line-color': '#ffffff', 'line-width': 5, 'line-opacity': 0.8}},
          {id: 'gr', type: 'line', source: 'gr', paint: {'line-color': C.ink, 'line-width': 2}},
        ],
        terrain: {source: 'dem', exaggeration: 1.5},
        sky: {'sky-color': C.bg, 'horizon-color': C.bg, 'fog-color': C.bg, 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.6, 'fog-ground-blend': 0.85},
      } as maplibregl.StyleSpecification,
      ...cam,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      maxPitch: 75,
      canvasContextAttributes: {preserveDrawingBuffer: true, antialias: true},
    } as maplibregl.MapOptions);
    TOWNS.forEach(([name, lon, lat]) => {
      const el = document.createElement('div');
      el.className = 'town';
      el.innerHTML = `<span class="dot"></span><span class="lbl">${name}</span>`;
      new maplibregl.Marker({element: el, anchor: 'left'}).setLngLat([lon, lat]).addTo(map);
    });
    mapRef.current = map;
    map.once('idle', () => {
      setReady(true);
      continueRender(initHandle);
    });
    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const handle = delayRender(`frame ${frame}`, {timeoutInMilliseconds: 120000});
    const row = SERIES[periodIndex(frame)];
    (map.getSource('cold') as maplibregl.ImageSource).updateImage({url: staticFile(`cold/${row.year}.png`), coordinates: BOUNDS});
    map.jumpTo(camera(frame));
    map.once('idle', () => continueRender(handle));
    map.triggerRepaint();
  }, [frame, ready]);

  return <div ref={ref} style={{position: 'absolute', left: 0, top: MAP_TOP, width: 1080, height: MAP_H}} />;
};

const Chart: React.FC<{upto: number}> = ({upto}) => {
  const x0 = 0, x1 = 880, y0 = 0, y1 = 170;
  const zmin = 2000, zmax = 2700;
  const px = (i: number) => x0 + (i / (SERIES.length - 1)) * (x1 - x0);
  const py = (z: number) => y1 - ((z - zmin) / (zmax - zmin)) * (y1 - y0);
  const pts = SERIES.slice(0, upto + 1).map((r, i) => `${px(i).toFixed(1)},${py(r.z0).toFixed(1)}`).join(' ');
  const last = SERIES[upto];
  return (
    <svg width={x1 + 20} height={y1 + 50} style={{overflow: 'visible'}}>
      {[2000, 2200, 2400, 2600].map((z) => (
        <g key={z}>
          <line x1={x0} x2={x1} y1={py(z)} y2={py(z)} stroke="#d4d2cc" strokeWidth={1.5} />
          <text x={x1 + 8} y={py(z) + 8} fontSize={22} fill={C.sub}>{z}</text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={px(upto)} cy={py(last.z0)} r={8} fill={C.lost} stroke={C.ink} strokeWidth={3} />
      {[0, SERIES.findIndex((r) => r.year === 1950), SERIES.length - 1].map((i) => (
        <text key={i} x={px(i)} y={y1 + 36} fontSize={22} fill={C.sub} textAnchor={i === 0 ? 'start' : i === SERIES.length - 1 ? 'end' : 'middle'}>
          {SERIES[i].year}
        </text>
      ))}
    </svg>
  );
};

const Credits: React.FC<{opacity: number}> = ({opacity}) => (
  <AbsoluteFill style={{background: C.bg, opacity, padding: '300px 70px', fontSize: 28, color: C.sub, lineHeight: 1.45}}>
    <div style={{fontSize: 60, fontWeight: 800, color: C.ink, marginBottom: 50}}>Graubünden, 1864–2025</div>
    <div style={{fontWeight: 700, color: C.ink, fontSize: 30}}>Daten</div>
    <div>Temperatur: MeteoSchweiz, räumliche Klimaanalyse TrecabsY1864 (Jahresmittel, ca. 2 km Raster; Isotta &amp; Frei 2019)</div>
    <div>Gelände: Mapterhorn-Terrainkacheln (Schweiz: swisstopo swissALTI3D), swisstopo swissALTIRegio</div>
    <div style={{marginBottom: 36}}>Kantonsgrenze: swisstopo swissBOUNDARIES3D</div>
    <div style={{fontWeight: 700, color: C.ink, fontSize: 30}}>Methode (eigene Modellierung)</div>
    <div>Gleitende 10-Jahres-Mittel. Höhe der 0-°C-Jahresisotherme aus linearer Beziehung Temperatur–Höhe über alle Rasterzellen in Graubünden.</div>
    <div style={{marginBottom: 36}}>Flächen: Rasterfeld bilinear interpoliert und mit dieser Beziehung auf ein 50-m-Höhenmodell übertragen. Gelände 1,5-fach überhöht.</div>
    <div style={{fontWeight: 700, color: C.ink, fontSize: 30}}>Einordnung</div>
    <div>Modellierte Werte, keine Einzelmessungen. Im Hochgebirge mit wenigen Stationen unsicherer.</div>
    <div style={{position: 'absolute', bottom: 260, fontWeight: 700, color: C.ink}}>© MeteoSchweiz · swisstopo · Mapterhorn</div>
  </AbsoluteFill>
);

export const Nullgrad: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = periodIndex(frame);
  const row = SERIES[idx];
  const credits = interpolate(frame, [INTRO + RUN + HOLD, INTRO + RUN + HOLD + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const intro = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: 'Inter, sans-serif', color: C.ink}}>
      <style>{`
        .town{display:flex;align-items:center;gap:8px;font:600 26px Inter,sans-serif;color:${C.ink};
              text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 6px #fff,0 0 6px #fff;white-space:nowrap}
        .town .dot{width:11px;height:11px;border-radius:50%;background:${C.ink};border:2px solid #fff}
      `}</style>
      <MapView frame={frame} />
      <div style={{position: 'absolute', left: 60, top: 60, right: 60, opacity: intro}}>
        <div style={{fontSize: 62, fontWeight: 800, lineHeight: 1.08}}>Die 0-Grad-Grenze<br />wandert nach oben</div>
        <div style={{fontSize: 28, color: C.sub, marginTop: 14}}>Graubünden: ab welcher Höhe das Jahresmittel unter 0 °C liegt (10-Jahres-Mittel)</div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 34}}>
          <div>
            <div style={{fontSize: 30, color: C.sub, fontWeight: 600}}>{row.from_}–{row.year}</div>
            <div style={{fontSize: 140, fontWeight: 800, lineHeight: 1, letterSpacing: -3}}>{(Math.round(row.z0 / 10) * 10).toLocaleString('de-CH')}<span style={{fontSize: 64}}> m</span></div>
            <div style={{fontSize: 26, color: C.sub}}>Höhe der 0-°C-Jahresgrenze (modelliert)</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 84, fontWeight: 800, lineHeight: 1}}>{Math.round(row.frac)} %</div>
            <div style={{fontSize: 26, color: C.sub}}>der Kantonsfläche<br />unter 0 °C</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, top: MAP_TOP + MAP_H - 120, display: 'flex', flexDirection: 'column', gap: 10,
                   background: 'rgba(246,246,243,0.88)', padding: '14px 18px', borderRadius: 12, fontSize: 24}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 28, height: 18, background: C.cold, border: '1px solid #9fb8cf', borderRadius: 4}} />Jahresmittel unter 0 °C</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: row.lost > 0.5 ? 1 : 0.35}}>
          <span style={{width: 28, height: 18, background: C.lost, borderRadius: 4}} />1864–1873 noch unter 0 °C, heute darüber</div>
      </div>
      <div style={{position: 'absolute', left: 60, top: MAP_TOP + MAP_H + 50}}>
        <Chart upto={idx} />
      </div>
      <div style={{position: 'absolute', left: 60, bottom: 40, fontSize: 19, color: C.sub}}>
        Daten: MeteoSchweiz, swisstopo, Mapterhorn · eigene Modellierung
      </div>
      {credits > 0 && <Credits opacity={credits} />}
    </AbsoluteFill>
  );
};
