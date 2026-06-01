const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_PASS = process.env.ADMIN_PASS || '238911';

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Data helpers ─────────────────────────────────────────────────────────────
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { participants: {}, results: {} };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { participants: {}, results: {} };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function normKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40);
}

// ── MATCHES DATA ─────────────────────────────────────────────────────────────
const GROUPS = [
  {g:"A",t:"México · Corea del Sur · Sudáfrica · Chequia",m:[
    {h:"México",hf:"🇲🇽",a:"Sudáfrica",af:"🇿🇦",j:1,d:"11 Jun",hr:"17:00"},
    {h:"Corea del Sur",hf:"🇰🇷",a:"Chequia",af:"🇨🇿",j:1,d:"11 Jun",hr:"20:00"},
    {h:"México",hf:"🇲🇽",a:"Chequia",af:"🇨🇿",j:2,d:"15 Jun",hr:"17:00"},
    {h:"Corea del Sur",hf:"🇰🇷",a:"Sudáfrica",af:"🇿🇦",j:2,d:"15 Jun",hr:"20:00"},
    {h:"México",hf:"🇲🇽",a:"Corea del Sur",af:"🇰🇷",j:3,d:"19 Jun",hr:"20:00"},
    {h:"Sudáfrica",hf:"🇿🇦",a:"Chequia",af:"🇨🇿",j:3,d:"19 Jun",hr:"20:00"}]},
  {g:"B",t:"Canadá · Suiza · Catar · Bosnia",m:[
    {h:"Canadá",hf:"🇨🇦",a:"Bosnia",af:"🇧🇦",j:1,d:"12 Jun",hr:"14:00"},
    {h:"Suiza",hf:"🇨🇭",a:"Catar",af:"🇶🇦",j:1,d:"12 Jun",hr:"17:00"},
    {h:"Canadá",hf:"🇨🇦",a:"Suiza",af:"🇨🇭",j:2,d:"16 Jun",hr:"17:00"},
    {h:"Catar",hf:"🇶🇦",a:"Bosnia",af:"🇧🇦",j:2,d:"16 Jun",hr:"20:00"},
    {h:"Canadá",hf:"🇨🇦",a:"Catar",af:"🇶🇦",j:3,d:"20 Jun",hr:"20:00"},
    {h:"Suiza",hf:"🇨🇭",a:"Bosnia",af:"🇧🇦",j:3,d:"20 Jun",hr:"20:00"}]},
  {g:"C",t:"Brasil · Marruecos · Escocia · Haití",m:[
    {h:"Brasil",hf:"🇧🇷",a:"Marruecos",af:"🇲🇦",j:1,d:"12 Jun",hr:"20:00"},
    {h:"Escocia",hf:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",a:"Haití",af:"🇭🇹",j:1,d:"13 Jun",hr:"14:00"},
    {h:"Brasil",hf:"🇧🇷",a:"Escocia",af:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",j:2,d:"17 Jun",hr:"14:00"},
    {h:"Marruecos",hf:"🇲🇦",a:"Haití",af:"🇭🇹",j:2,d:"17 Jun",hr:"17:00"},
    {h:"Brasil",hf:"🇧🇷",a:"Haití",af:"🇭🇹",j:3,d:"21 Jun",hr:"20:00"},
    {h:"Marruecos",hf:"🇲🇦",a:"Escocia",af:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",j:3,d:"21 Jun",hr:"20:00"}]},
  {g:"D",t:"EE.UU. · Paraguay · Australia · Turquía",m:[
    {h:"EE.UU.",hf:"🇺🇸",a:"Paraguay",af:"🇵🇾",j:1,d:"13 Jun",hr:"17:00"},
    {h:"Australia",hf:"🇦🇺",a:"Turquía",af:"🇹🇷",j:1,d:"13 Jun",hr:"20:00"},
    {h:"EE.UU.",hf:"🇺🇸",a:"Australia",af:"🇦🇺",j:2,d:"17 Jun",hr:"20:00"},
    {h:"Paraguay",hf:"🇵🇾",a:"Turquía",af:"🇹🇷",j:2,d:"18 Jun",hr:"14:00"},
    {h:"EE.UU.",hf:"🇺🇸",a:"Turquía",af:"🇹🇷",j:3,d:"22 Jun",hr:"20:00"},
    {h:"Paraguay",hf:"🇵🇾",a:"Australia",af:"🇦🇺",j:3,d:"22 Jun",hr:"20:00"}]},
  {g:"E",t:"Alemania · Ecuador · C. de Marfil · Curazao",m:[
    {h:"Alemania",hf:"🇩🇪",a:"Ecuador",af:"🇪🇨",j:1,d:"14 Jun",hr:"14:00"},
    {h:"C. de Marfil",hf:"🇨🇮",a:"Curazao",af:"🇨🇼",j:1,d:"14 Jun",hr:"17:00"},
    {h:"Alemania",hf:"🇩🇪",a:"C. de Marfil",af:"🇨🇮",j:2,d:"18 Jun",hr:"17:00"},
    {h:"Ecuador",hf:"🇪🇨",a:"Curazao",af:"🇨🇼",j:2,d:"18 Jun",hr:"20:00"},
    {h:"Alemania",hf:"🇩🇪",a:"Curazao",af:"🇨🇼",j:3,d:"22 Jun",hr:"20:00"},
    {h:"Ecuador",hf:"🇪🇨",a:"C. de Marfil",af:"🇨🇮",j:3,d:"22 Jun",hr:"20:00"}]},
  {g:"F",t:"Países Bajos · Japón · Túnez · Suecia",m:[
    {h:"Países Bajos",hf:"🇳🇱",a:"Japón",af:"🇯🇵",j:1,d:"14 Jun",hr:"20:00"},
    {h:"Túnez",hf:"🇹🇳",a:"Suecia",af:"🇸🇪",j:1,d:"15 Jun",hr:"14:00"},
    {h:"Países Bajos",hf:"🇳🇱",a:"Túnez",af:"🇹🇳",j:2,d:"19 Jun",hr:"14:00"},
    {h:"Japón",hf:"🇯🇵",a:"Suecia",af:"🇸🇪",j:2,d:"19 Jun",hr:"17:00"},
    {h:"Países Bajos",hf:"🇳🇱",a:"Suecia",af:"🇸🇪",j:3,d:"23 Jun",hr:"20:00"},
    {h:"Japón",hf:"🇯🇵",a:"Túnez",af:"🇹🇳",j:3,d:"23 Jun",hr:"20:00"}]},
  {g:"G",t:"Bélgica · Irán · Egipto · Nueva Zelanda",m:[
    {h:"Bélgica",hf:"🇧🇪",a:"Irán",af:"🇮🇷",j:1,d:"15 Jun",hr:"17:00"},
    {h:"Egipto",hf:"🇪🇬",a:"Nueva Zelanda",af:"🇳🇿",j:1,d:"15 Jun",hr:"20:00"},
    {h:"Bélgica",hf:"🇧🇪",a:"Egipto",af:"🇪🇬",j:2,d:"19 Jun",hr:"17:00"},
    {h:"Irán",hf:"🇮🇷",a:"Nueva Zelanda",af:"🇳🇿",j:2,d:"20 Jun",hr:"14:00"},
    {h:"Bélgica",hf:"🇧🇪",a:"Nueva Zelanda",af:"🇳🇿",j:3,d:"24 Jun",hr:"20:00"},
    {h:"Irán",hf:"🇮🇷",a:"Egipto",af:"🇪🇬",j:3,d:"24 Jun",hr:"20:00"}]},
  {g:"H",t:"España · Uruguay · Arabia Saudita · Cabo Verde",m:[
    {h:"España",hf:"🇪🇸",a:"Cabo Verde",af:"🇨🇻",j:1,d:"16 Jun",hr:"14:00"},
    {h:"Uruguay",hf:"🇺🇾",a:"Arabia Saudita",af:"🇸🇦",j:1,d:"16 Jun",hr:"17:00"},
    {h:"España",hf:"🇪🇸",a:"Arabia Saudita",af:"🇸🇦",j:2,d:"20 Jun",hr:"17:00"},
    {h:"Uruguay",hf:"🇺🇾",a:"Cabo Verde",af:"🇨🇻",j:2,d:"20 Jun",hr:"20:00"},
    {h:"España",hf:"🇪🇸",a:"Uruguay",af:"🇺🇾",j:3,d:"24 Jun",hr:"20:00"},
    {h:"Arabia Saudita",hf:"🇸🇦",a:"Cabo Verde",af:"🇨🇻",j:3,d:"24 Jun",hr:"20:00"}]},
  {g:"I",t:"Francia · Senegal · Noruega · Irak",m:[
    {h:"Francia",hf:"🇫🇷",a:"Senegal",af:"🇸🇳",j:1,d:"16 Jun",hr:"20:00"},
    {h:"Noruega",hf:"🇳🇴",a:"Irak",af:"🇮🇶",j:1,d:"17 Jun",hr:"14:00"},
    {h:"Francia",hf:"🇫🇷",a:"Noruega",af:"🇳🇴",j:2,d:"21 Jun",hr:"14:00"},
    {h:"Senegal",hf:"🇸🇳",a:"Irak",af:"🇮🇶",j:2,d:"21 Jun",hr:"17:00"},
    {h:"Francia",hf:"🇫🇷",a:"Irak",af:"🇮🇶",j:3,d:"25 Jun",hr:"20:00"},
    {h:"Senegal",hf:"🇸🇳",a:"Noruega",af:"🇳🇴",j:3,d:"25 Jun",hr:"20:00"}]},
  {g:"J",t:"Argentina · Austria · Argelia · Jordania",m:[
    {h:"Argentina",hf:"🇦🇷",a:"Jordania",af:"🇯🇴",j:1,d:"17 Jun",hr:"20:00"},
    {h:"Austria",hf:"🇦🇹",a:"Argelia",af:"🇩🇿",j:1,d:"18 Jun",hr:"14:00"},
    {h:"Argentina",hf:"🇦🇷",a:"Austria",af:"🇦🇹",j:2,d:"22 Jun",hr:"14:00"},
    {h:"Argelia",hf:"🇩🇿",a:"Jordania",af:"🇯🇴",j:2,d:"22 Jun",hr:"17:00"},
    {h:"Argentina",hf:"🇦🇷",a:"Argelia",af:"🇩🇿",j:3,d:"26 Jun",hr:"20:00"},
    {h:"Austria",hf:"🇦🇹",a:"Jordania",af:"🇯🇴",j:3,d:"26 Jun",hr:"20:00"}]},
  {g:"K",t:"Portugal · Colombia · Uzbekistán · Congo RD",m:[
    {h:"Portugal",hf:"🇵🇹",a:"Colombia",af:"🇨🇴",j:1,d:"18 Jun",hr:"20:00"},
    {h:"Uzbekistán",hf:"🇺🇿",a:"Congo RD",af:"🇨🇩",j:1,d:"19 Jun",hr:"14:00"},
    {h:"Portugal",hf:"🇵🇹",a:"Uzbekistán",af:"🇺🇿",j:2,d:"23 Jun",hr:"14:00"},
    {h:"Colombia",hf:"🇨🇴",a:"Congo RD",af:"🇨🇩",j:2,d:"23 Jun",hr:"17:00"},
    {h:"Portugal",hf:"🇵🇹",a:"Congo RD",af:"🇨🇩",j:3,d:"27 Jun",hr:"20:00"},
    {h:"Colombia",hf:"🇨🇴",a:"Uzbekistán",af:"🇺🇿",j:3,d:"27 Jun",hr:"20:00"}]},
  {g:"L",t:"Inglaterra · Croacia · Panamá · Ghana",m:[
    {h:"Inglaterra",hf:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",a:"Croacia",af:"🇭🇷",j:1,d:"20 Jun",hr:"14:00"},
    {h:"Panamá",hf:"🇵🇦",a:"Ghana",af:"🇬🇭",j:1,d:"20 Jun",hr:"17:00"},
    {h:"Inglaterra",hf:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",a:"Panamá",af:"🇵🇦",j:2,d:"24 Jun",hr:"14:00"},
    {h:"Croacia",hf:"🇭🇷",a:"Ghana",af:"🇬🇭",j:2,d:"24 Jun",hr:"17:00"},
    {h:"Inglaterra",hf:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",a:"Ghana",af:"🇬🇭",j:3,d:"28 Jun",hr:"20:00"},
    {h:"Croacia",hf:"🇭🇷",a:"Panamá",af:"🇵🇦",j:3,d:"28 Jun",hr:"20:00"}]}
];

// Flat match list
const ALL_MATCHES = [];
GROUPS.forEach(g => g.m.forEach((m, i) => ALL_MATCHES.push({ ...m, id: g.g + i, gn: g.g })));

// ── Score calculation ─────────────────────────────────────────────────────────
function calcPts(pred, res) {
  if (!pred || !res || pred.h === '' || pred.a === '' || res.h === '' || res.a === '') return null;
  const ph = +pred.h, pa = +pred.a, rh = +res.h, ra = +res.a;
  if (isNaN(ph) || isNaN(pa) || isNaN(rh) || isNaN(ra)) return null;
  if (ph === rh && pa === ra) return 3;
  const r = (a, b) => a > b ? 'H' : a < b ? 'A' : 'E';
  return r(ph, pa) === r(rh, ra) ? 1 : 0;
}

// ── API ROUTES ────────────────────────────────────────────────────────────────

// Get all data (participants + results)
app.get('/api/data', (req, res) => {
  res.json(readData());
});

// Get matches list
app.get('/api/matches', (req, res) => {
  res.json(GROUPS);
});

// Save participant predictions
app.post('/api/save', (req, res) => {
  const { name, predictions } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const key = normKey(name);
  const data = readData();
  if (!data.participants) data.participants = {};
  const existing = data.participants[key] || {};
  // Only update unlocked predictions
  const merged = { ...existing.predictions };
  Object.keys(predictions || {}).forEach(id => {
    if (!merged[id] || !merged[id].locked) {
      merged[id] = predictions[id];
    }
  });
  data.participants[key] = {
    name,
    predictions: merged,
    savedAt: new Date().toISOString()
  };
  writeData(data);
  res.json({ ok: true, key });
});

// Get participant by name
app.get('/api/participant/:name', (req, res) => {
  const key = normKey(req.params.name);
  const data = readData();
  const p = (data.participants || {})[key];
  res.json(p || null);
});

// Save official results (admin only)
app.post('/api/results', (req, res) => {
  const { password, results } = req.body;
  if (password !== ADMIN_PASS) return res.status(403).json({ error: 'Unauthorized' });
  const data = readData();
  data.results = results || {};
  writeData(data);
  res.json({ ok: true });
});

// Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const data = readData();
  const results = data.results || {};
  const parts = data.participants || {};
  const rows = Object.keys(parts).map(key => {
    const p = parts[key];
    const preds = p.predictions || {};
    let pts = 0, exact = 0, filled = 0, locked = 0;
    ALL_MATCHES.forEach(m => {
      const pred = preds[m.id];
      const res = results[m.id];
      if (pred && pred.h !== '' && pred.a !== '') filled++;
      if (pred && pred.locked) locked++;
      const pt = calcPts(pred, res);
      if (pt !== null) { pts += pt; if (pt === 3) exact++; }
    });
    return { name: p.name || key, pts, exact, filled, locked };
  });
  rows.sort((a, b) => b.pts - a.pts || b.exact - a.exact);
  res.json({ rows, resultsCount: Object.keys(results).length });
});

// Admin verify
app.post('/api/admin-verify', (req, res) => {
  res.json({ ok: req.body.password === ADMIN_PASS });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Quiniela Dona Corneta corriendo en puerto ${PORT}`);
});
