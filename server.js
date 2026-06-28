const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const MONGO_URI = process.env.MONGO_URI || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── MongoDB ──────────────────────────────────────────────────────────────────
let db = null;
async function connectDB() {
  if (!MONGO_URI) return;
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db('quiniela');
    console.log('MongoDB conectado');
  } catch (e) {
    console.error('MongoDB error:', e.message);
  }
}

// ── Data helpers ─────────────────────────────────────────────────────────────
const memData = { participants: {}, results: {}, knockoutResults: {}, knockoutMatches: {} };

async function getData() {
  if (!db) return memData;
  const doc = await db.collection('state').findOne({ _id: 'main' });
  return doc || { participants: {}, results: {}, knockoutResults: {}, knockoutMatches: {} };
}

async function setData(data) {
  if (!db) { Object.assign(memData, data); return; }
  await db.collection('state').updateOne(
    { _id: 'main' },
    { $set: data },
    { upsert: true }
  );
}

// ── Partidos fase de grupos (original) ───────────────────────────────────────
const GROUP_MATCHES = [
  // Grupo A
  {id:'a1',group:'A',home:'México',away:'Sudáfrica',date:'2026-06-11'},
  {id:'a2',group:'A',home:'Corea del Sur',away:'Chequia',date:'2026-06-11'},
  {id:'a3',group:'A',home:'México',away:'Corea del Sur',date:'2026-06-15'},
  {id:'a4',group:'A',home:'Sudáfrica',away:'Chequia',date:'2026-06-15'},
  {id:'a5',group:'A',home:'México',away:'Chequia',date:'2026-06-19'},
  {id:'a6',group:'A',home:'Sudáfrica',away:'Corea del Sur',date:'2026-06-19'},
  // Grupo B
  {id:'b1',group:'B',home:'Canadá',away:'Catar',date:'2026-06-12'},
  {id:'b2',group:'B',home:'Suiza',away:'Bosnia',date:'2026-06-12'},
  {id:'b3',group:'B',home:'Canadá',away:'Suiza',date:'2026-06-16'},
  {id:'b4',group:'B',home:'Catar',away:'Bosnia',date:'2026-06-16'},
  {id:'b5',group:'B',home:'Canadá',away:'Bosnia',date:'2026-06-20'},
  {id:'b6',group:'B',home:'Catar',away:'Suiza',date:'2026-06-20'},
  // Grupo C
  {id:'c1',group:'C',home:'Brasil',away:'Marruecos',date:'2026-06-12'},
  {id:'c2',group:'C',home:'Escocia',away:'Irak',date:'2026-06-12'},
  {id:'c3',group:'C',home:'Brasil',away:'Escocia',date:'2026-06-16'},
  {id:'c4',group:'C',home:'Marruecos',away:'Irak',date:'2026-06-16'},
  {id:'c5',group:'C',home:'Brasil',away:'Irak',date:'2026-06-20'},
  {id:'c6',group:'C',home:'Marruecos',away:'Escocia',date:'2026-06-20'},
  // Grupo D
  {id:'d1',group:'D',home:'Francia',away:'Suecia',date:'2026-06-13'},
  {id:'d2',group:'D',home:'Congo RD',away:'Turquía',date:'2026-06-13'},
  {id:'d3',group:'D',home:'Francia',away:'Congo RD',date:'2026-06-17'},
  {id:'d4',group:'D',home:'Suecia',away:'Turquía',date:'2026-06-17'},
  {id:'d5',group:'D',home:'Francia',away:'Turquía',date:'2026-06-21'},
  {id:'d6',group:'D',home:'Congo RD',away:'Suecia',date:'2026-06-21'},
  // Grupo E
  {id:'e1',group:'E',home:'España',away:'Cabo Verde',date:'2026-06-13'},
  {id:'e2',group:'E',home:'Austria',away:'Costa Rica',date:'2026-06-13'},
  {id:'e3',group:'E',home:'España',away:'Austria',date:'2026-06-17'},
  {id:'e4',group:'E',home:'Cabo Verde',away:'Costa Rica',date:'2026-06-17'},
  {id:'e5',group:'E',home:'España',away:'Costa Rica',date:'2026-06-21'},
  {id:'e6',group:'E',home:'Cabo Verde',away:'Austria',date:'2026-06-21'},
  // Grupo F
  {id:'f1',group:'F',home:'Argentina',away:'Jordania',date:'2026-06-14'},
  {id:'f2',group:'F',home:'Ecuador',away:'Noruega',date:'2026-06-14'},
  {id:'f3',group:'F',home:'Argentina',away:'Ecuador',date:'2026-06-18'},
  {id:'f4',group:'F',home:'Jordania',away:'Noruega',date:'2026-06-18'},
  {id:'f5',group:'F',home:'Argentina',away:'Noruega',date:'2026-06-22'},
  {id:'f6',group:'F',home:'Jordania',away:'Ecuador',date:'2026-06-22'},
  // Grupo G
  {id:'g1',group:'G',home:'EE.UU.',away:'Bolivia',date:'2026-06-14'},
  {id:'g2',group:'G',home:'Panamá',away:'Egipto',date:'2026-06-14'},
  {id:'g3',group:'G',home:'EE.UU.',away:'Panamá',date:'2026-06-18'},
  {id:'g4',group:'G',home:'Bolivia',away:'Egipto',date:'2026-06-18'},
  {id:'g5',group:'G',home:'EE.UU.',away:'Egipto',date:'2026-06-22'},
  {id:'g6',group:'G',home:'Bolivia',away:'Panamá',date:'2026-06-22'},
  // Grupo H
  {id:'h1',group:'H',home:'Portugal',away:'Rumanía',date:'2026-06-15'},
  {id:'h2',group:'H',home:'Bélgica',away:'Senegal',date:'2026-06-15'},
  {id:'h3',group:'H',home:'Portugal',away:'Bélgica',date:'2026-06-19'},
  {id:'h4',group:'H',home:'Rumanía',away:'Senegal',date:'2026-06-19'},
  {id:'h5',group:'H',home:'Portugal',away:'Senegal',date:'2026-06-23'},
  {id:'h6',group:'H',home:'Rumanía',away:'Bélgica',date:'2026-06-23'},
  // Grupo I
  {id:'i1',group:'I',home:'Países Bajos',away:'Perú',date:'2026-06-15'},
  {id:'i2',group:'I',home:'Colombia',away:'Ghana',date:'2026-06-15'},
  {id:'i3',group:'I',home:'Países Bajos',away:'Colombia',date:'2026-06-19'},
  {id:'i4',group:'I',home:'Perú',away:'Ghana',date:'2026-06-19'},
  {id:'i5',group:'I',home:'Países Bajos',away:'Ghana',date:'2026-06-23'},
  {id:'i6',group:'I',home:'Perú',away:'Colombia',date:'2026-06-23'},
  // Grupo J
  {id:'j1',group:'J',home:'Alemania',away:'Arabia Saudita',date:'2026-06-16'},
  {id:'j2',group:'J',home:'Paraguay',away:'Australia',date:'2026-06-16'},
  {id:'j3',group:'J',home:'Alemania',away:'Paraguay',date:'2026-06-20'},
  {id:'j4',group:'J',home:'Arabia Saudita',away:'Australia',date:'2026-06-20'},
  {id:'j5',group:'J',home:'Alemania',away:'Australia',date:'2026-06-24'},
  {id:'j6',group:'J',home:'Arabia Saudita',away:'Paraguay',date:'2026-06-24'},
  // Grupo K
  {id:'k1',group:'K',home:'Japón',away:'Costa de Marfil',date:'2026-06-16'},
  {id:'k2',group:'K',home:'Croacia',away:'Costa Rica',date:'2026-06-16'},
  {id:'k3',group:'K',home:'Japón',away:'Croacia',date:'2026-06-20'},
  {id:'k4',group:'K',home:'Costa de Marfil',away:'Costa Rica',date:'2026-06-20'},
  {id:'k5',group:'K',home:'Japón',away:'Costa Rica',date:'2026-06-24'},
  {id:'k6',group:'K',home:'Costa de Marfil',away:'Croacia',date:'2026-06-24'},
  // Grupo L
  {id:'l1',group:'L',home:'Uruguay',away:'Irak',date:'2026-06-17'},
  {id:'l2',group:'L',home:'Serbia',away:'Argelia',date:'2026-06-17'},
  {id:'l3',group:'L',home:'Uruguay',away:'Serbia',date:'2026-06-21'},
  {id:'l4',group:'L',home:'Irak',away:'Argelia',date:'2026-06-21'},
  {id:'l5',group:'L',home:'Uruguay',away:'Argelia',date:'2026-06-25'},
  {id:'l6',group:'L',home:'Irak',away:'Serbia',date:'2026-06-25'},
];

// ── Partidos dieciseisavos ────────────────────────────────────────────────────
const R32_MATCHES = [
  {id:'r32_1', round:'Dieciseisavos', home:'Sudáfrica', away:'Canadá', date:'2026-06-28', time:'14:00'},
  {id:'r32_2', round:'Dieciseisavos', home:'Brasil', away:'Japón', date:'2026-06-29', time:'12:00'},
  {id:'r32_3', round:'Dieciseisavos', home:'Alemania', away:'Paraguay', date:'2026-06-29', time:'15:30'},
  {id:'r32_4', round:'Dieciseisavos', home:'Países Bajos', away:'Marruecos', date:'2026-06-29', time:'20:00'},
  {id:'r32_5', round:'Dieciseisavos', home:'Costa de Marfil', away:'Noruega', date:'2026-06-30', time:'12:00'},
  {id:'r32_6', round:'Dieciseisavos', home:'Francia', away:'Suecia', date:'2026-06-30', time:'16:00'},
  {id:'r32_7', round:'Dieciseisavos', home:'México', away:'Ecuador', date:'2026-06-30', time:'20:00'},
  {id:'r32_8', round:'Dieciseisavos', home:'Inglaterra', away:'RD Congo', date:'2026-07-01', time:'11:00'},
  {id:'r32_9', round:'Dieciseisavos', home:'Bélgica', away:'Senegal', date:'2026-07-01', time:'15:00'},
  {id:'r32_10', round:'Dieciseisavos', home:'EE.UU.', away:'Bosnia', date:'2026-07-01', time:'19:00'},
  {id:'r32_11', round:'Dieciseisavos', home:'España', away:'Austria', date:'2026-07-02', time:'14:00'},
  {id:'r32_12', round:'Dieciseisavos', home:'Portugal', away:'Croacia', date:'2026-07-02', time:'18:00'},
  {id:'r32_13', round:'Dieciseisavos', home:'Suiza', away:'Argelia', date:'2026-07-02', time:'22:00'},
  {id:'r32_14', round:'Dieciseisavos', home:'Australia', away:'Egipto', date:'2026-07-03', time:'13:00'},
  {id:'r32_15', round:'Dieciseisavos', home:'Argentina', away:'Cabo Verde', date:'2026-07-03', time:'17:00'},
  {id:'r32_16', round:'Dieciseisavos', home:'Colombia', away:'Ghana', date:'2026-07-03', time:'20:30'},
];

// ── Fases eliminatorias (octavos a final) — definidas por admin ──────────────
const KNOCKOUT_ROUNDS = [
  { id: 'r16', name: 'Octavos de final', matches: 8 },
  { id: 'qf', name: 'Cuartos de final', matches: 4 },
  { id: 'sf', name: 'Semifinales', matches: 2 },
  { id: 'third', name: 'Tercer lugar', matches: 1 },
  { id: 'final', name: 'Final', matches: 1 },
];

// ── Scoring ───────────────────────────────────────────────────────────────────
function calcPoints(pred, official) {
  if (!pred || !official) return null;
  const ph = parseInt(pred.h), pa = parseInt(pred.a);
  const oh = parseInt(official.h), oa = parseInt(official.a);
  if (isNaN(ph)||isNaN(pa)||isNaN(oh)||isNaN(oa)) return null;
  if (ph===oh && pa===oa) return 3;
  const predResult = ph>pa?'H':ph<pa?'A':'D';
  const offResult = oh>oa?'H':oh<oa?'A':'D';
  if (predResult===offResult) return 1;
  return 0;
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  const data = await getData();
  res.json({ ok: true, db: db ? 'MongoDB' : 'memory', participants: Object.keys(data.participants||{}).length, results: Object.keys(data.results||{}).length });
});

app.get('/api/matches', (_req, res) => {
  res.json({ groups: GROUP_MATCHES, r32: R32_MATCHES, knockoutRounds: KNOCKOUT_ROUNDS });
});

// Register / login
app.post('/api/register', async (req, res) => {
  const { name, pin } = req.body;
  if (!name || !pin || pin.length !== 5) return res.status(400).json({ error: 'Nombre y PIN de 5 dígitos requeridos' });
  const data = await getData();
  if (data.participants[name]) return res.status(409).json({ error: 'Ya registrado' });
  data.participants[name] = { pin, predictions: {}, knockoutPredictions: {}, locked: {}, knockoutLocked: {}, createdAt: new Date().toISOString() };
  await setData({ participants: data.participants });
  res.json({ ok: true });
});

app.post('/api/login', async (req, res) => {
  const { name, pin } = req.body;
  const data = await getData();
  const p = data.participants[name];
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  if (p.pin !== pin) return res.status(401).json({ error: 'PIN incorrecto' });
  res.json({ ok: true, predictions: p.predictions || {}, knockoutPredictions: p.knockoutPredictions || {}, locked: p.locked || {}, knockoutLocked: p.knockoutLocked || {} });
});

// Save group predictions
app.post('/api/save', async (req, res) => {
  const { name, pin, predictions, locked } = req.body;
  const data = await getData();
  const p = data.participants[name];
  if (!p || p.pin !== pin) return res.status(401).json({ error: 'No autorizado' });
  p.predictions = predictions;
  p.locked = locked;
  await setData({ participants: data.participants });
  res.json({ ok: true });
});

// Save knockout predictions
app.post('/api/save-knockout', async (req, res) => {
  const { name, pin, knockoutPredictions, knockoutLocked } = req.body;
  const data = await getData();
  const p = data.participants[name];
  if (!p || p.pin !== pin) return res.status(401).json({ error: 'No autorizado' });
  p.knockoutPredictions = knockoutPredictions;
  p.knockoutLocked = knockoutLocked;
  await setData({ participants: data.participants });
  res.json({ ok: true });
});

// Admin verify
app.post('/api/admin-verify', (req, res) => {
  res.json({ ok: req.body.password === ADMIN_PASS });
});

// Admin: save group results
app.post('/api/results', async (req, res) => {
  if (req.headers['x-admin-pass'] !== ADMIN_PASS && req.body.password !== ADMIN_PASS)
    return res.status(403).json({ error: 'No autorizado' });
  const data = await getData();
  data.results = { ...data.results, ...req.body.results };
  await setData({ results: data.results });
  res.json({ ok: true });
});

// Admin: save knockout results
app.post('/api/knockout-results', async (req, res) => {
  if (req.body.password !== ADMIN_PASS) return res.status(403).json({ error: 'No autorizado' });
  const data = await getData();
  data.knockoutResults = { ...data.knockoutResults, ...req.body.results };
  await setData({ knockoutResults: data.knockoutResults });
  res.json({ ok: true });
});

// Admin: define knockout matches (octavos, cuartos, etc.)
app.post('/api/knockout-matches', async (req, res) => {
  if (req.body.password !== ADMIN_PASS) return res.status(403).json({ error: 'No autorizado' });
  const data = await getData();
  data.knockoutMatches = { ...data.knockoutMatches, ...req.body.matches };
  await setData({ knockoutMatches: data.knockoutMatches });
  res.json({ ok: true });
});

// Admin: get all data
app.get('/api/admin/data', async (req, res) => {
  if (req.headers['x-admin-pass'] !== ADMIN_PASS) return res.status(403).json({ error: 'No autorizado' });
  const data = await getData();
  
  // Calculate scores for each participant
  const scores = {};
  for (const [name, p] of Object.entries(data.participants || {})) {
    let groupPts = 0, knockoutPts = 0;
    // Group stage
    for (const [mid, pred] of Object.entries(p.predictions || {})) {
      const off = data.results[mid];
      const pts = calcPoints(pred, off);
      if (pts !== null) groupPts += pts;
    }
    // R32 + knockout
    for (const [mid, pred] of Object.entries(p.knockoutPredictions || {})) {
      const off = data.knockoutResults[mid];
      const pts = calcPoints(pred, off);
      if (pts !== null) knockoutPts += pts;
    }
    scores[name] = { groupPts, knockoutPts, total: groupPts + knockoutPts, createdAt: p.createdAt, submitted: Object.keys(p.locked||{}).length };
  }
  
  res.json({ participants: data.participants, results: data.results, knockoutResults: data.knockoutResults, knockoutMatches: data.knockoutMatches, scores });
});

// Public scores
app.get('/api/scores', async (_req, res) => {
  const data = await getData();
  const scores = [];
  for (const [name, p] of Object.entries(data.participants || {})) {
    let groupPts = 0, knockoutPts = 0;
    for (const [mid, pred] of Object.entries(p.predictions || {})) {
      const off = data.results[mid];
      const pts = calcPoints(pred, off);
      if (pts !== null) groupPts += pts;
    }
    for (const [mid, pred] of Object.entries(p.knockoutPredictions || {})) {
      const off = data.knockoutResults[mid];
      const pts = calcPoints(pred, off);
      if (pts !== null) knockoutPts += pts;
    }
    scores.push({ name, groupPts, knockoutPts, total: groupPts + knockoutPts });
  }
  scores.sort((a, b) => b.total - a.total);
  res.json({ scores, knockoutMatches: data.knockoutMatches || {}, knockoutResults: data.knockoutResults || {} });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
