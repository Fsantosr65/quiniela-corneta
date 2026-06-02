const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'corneta2026';
const MONGO_URI = process.env.MONGO_URI || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── DATABASE ──────────────────────────────────────────────────────────────────
let col = null; // participants collection
let resCol = null; // results collection

async function initDB() {
  if (!MONGO_URI) { console.log('Sin MONGO_URI — datos en memoria'); return; }
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db('quiniela2026');
    col = db.collection('participants');
    resCol = db.collection('results');
    await col.createIndex({ key: 1 }, { unique: true });
    console.log('MongoDB OK');
  } catch (e) {
    console.error('MongoDB error:', e.message);
    col = null; resCol = null;
  }
}

// In-memory fallback
const memParticipants = {};
let memResults = {};

function normKey(n) { return n.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40); }

async function getParticipant(key) {
  if (col) {
    const doc = await col.findOne({ key });
    return doc || null;
  }
  return memParticipants[key] || null;
}

async function upsertParticipant(key, data) {
  if (col) {
    await col.replaceOne({ key }, { key, ...data }, { upsert: true });
  } else {
    memParticipants[key] = data;
  }
}

async function getAllParticipants() {
  if (col) {
    return col.find({}).toArray();
  }
  return Object.values(memParticipants);
}

async function getResults() {
  if (resCol) {
    const doc = await resCol.findOne({ _id: 'main' });
    return doc ? doc.data : {};
  }
  return memResults;
}

async function saveResults(data) {
  if (resCol) {
    await resCol.replaceOne({ _id: 'main' }, { _id: 'main', data }, { upsert: true });
  } else {
    memResults = data;
  }
}

// ── MATCH DATA ────────────────────────────────────────────────────────────────
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

const ALL_MATCHES = [];
GROUPS.forEach(g => g.m.forEach((m, i) => ALL_MATCHES.push({ ...m, id: g.g + i })));

function calcPts(pred, res) {
  if (!pred || !res) return null;
  if (pred.h === '' || pred.h == null || pred.a === '' || pred.a == null) return null;
  if (res.h === '' || res.h == null || res.a === '' || res.a == null) return null;
  const ph = +pred.h, pa = +pred.a, rh = +res.h, ra = +res.a;
  if (isNaN(ph)||isNaN(pa)||isNaN(rh)||isNaN(ra)) return null;
  if (ph===rh && pa===ra) return 3;
  const r = (a,b) => a>b?'H':a<b?'A':'E';
  return r(ph,pa)===r(rh,ra) ? 1 : 0;
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

app.get('/api/matches', (req, res) => res.json(GROUPS));

app.get('/api/health', async (req, res) => {
  const all = await getAllParticipants();
  const rez = await getResults();
  res.json({ ok:true, db: col?'MongoDB':'memory', participants:all.length, results:Object.keys(rez).length });
});

// Check if name exists
app.get('/api/check/:name', async (req, res) => {
  try {
    const key = normKey(req.params.name);
    const p = await getParticipant(key);
    res.json({ exists: !!p, createdAt: p ? p.createdAt : null });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Register new participant with PIN
app.post('/api/register', async (req, res) => {
  try {
    const { name, pin } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre requerido' });
    if (!pin || !/^\d{5}$/.test(pin)) return res.status(400).json({ error: 'PIN debe ser de 5 dígitos' });
    const key = normKey(name.trim());
    const existing = await getParticipant(key);
    if (existing) return res.status(409).json({ error: 'Ese nombre ya está registrado', createdAt: existing.createdAt });
    const newP = {
      name: name.trim(),
      pin,
      predictions: {},
      createdAt: new Date().toISOString(),
      savedAt: new Date().toISOString()
    };
    await upsertParticipant(key, newP);
    res.json({ ok: true, key });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Login with name + PIN
app.post('/api/login', async (req, res) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) return res.status(400).json({ error: 'Nombre y PIN requeridos' });
    const key = normKey(name.trim());
    const p = await getParticipant(key);
    if (!p) return res.status(404).json({ error: 'Nombre no encontrado' });
    if (p.pin !== pin) return res.status(401).json({ error: 'PIN incorrecto' });
    const { pin: _, ...safe } = p;
    res.json({ ok: true, participant: safe });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Save predictions (requires PIN verification)
app.post('/api/save', async (req, res) => {
  try {
    const { name, pin, predictions } = req.body;
    if (!name || !pin) return res.status(400).json({ error: 'Nombre y PIN requeridos' });
    const key = normKey(name.trim());
    const p = await getParticipant(key);
    if (!p) return res.status(404).json({ error: 'Participante no encontrado' });
    if (p.pin !== pin) return res.status(401).json({ error: 'PIN incorrecto' });

    // Merge predictions — never overwrite locked
    const merged = { ...p.predictions };
    if (predictions && typeof predictions === 'object') {
      Object.keys(predictions).forEach(id => {
        if (!merged[id] || !merged[id].locked) {
          merged[id] = predictions[id];
        }
      });
    }

    await upsertParticipant(key, {
      ...p,
      predictions: merged,
      savedAt: new Date().toISOString()
    });

    const locked = Object.values(merged).filter(x => x && x.locked).length;
    const filled = Object.values(merged).filter(x => x && x.h !== '' && x.a !== '').length;
    res.json({ ok: true, filled, locked });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Leaderboard (public)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const all = await getAllParticipants();
    const rez = await getResults();
    const rows = all.map(p => {
      const preds = p.predictions || {};
      let pts=0, exact=0, filled=0, locked=0;
      ALL_MATCHES.forEach(m => {
        const pred = preds[m.id];
        const r = rez[m.id];
        if (pred && pred.h!=='' && pred.a!=='') filled++;
        if (pred && pred.locked) locked++;
        const pt = calcPts(pred, r);
        if (pt !== null) { pts += pt; if (pt===3) exact++; }
      });
      return { name: p.name, pts, exact, filled, locked, savedAt: p.savedAt };
    });
    rows.sort((a,b) => b.pts-a.pts || b.exact-a.exact || b.locked-a.locked);
    res.json({ rows, resultsCount: Object.keys(rez).length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: verify password
app.post('/api/admin-verify', (req, res) => {
  res.json({ ok: req.body.password === ADMIN_PASS });
});

// Admin: get all data
app.get('/api/admin/data', async (req, res) => {
  const auth = req.headers['x-admin-pass'];
  if (auth !== ADMIN_PASS) return res.status(403).json({ error: 'No autorizado' });
  try {
    const all = await getAllParticipants();
    const rez = await getResults();
    const safe = all.map(({ pin, ...rest }) => rest);
    res.json({ participants: safe, results: rez });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: save official results
app.post('/api/results', async (req, res) => {
  const { password, results: newResults } = req.body;
  if (password !== ADMIN_PASS) return res.status(403).json({ error: 'No autorizado' });
  try {
    await saveResults(newResults || {});
    res.json({ ok: true, count: Object.keys(newResults||{}).length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`Quiniela Doña Corneta — puerto ${PORT} — DB: ${col?'MongoDB':'memoria'}`));
});
