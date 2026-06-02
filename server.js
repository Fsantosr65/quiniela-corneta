const express = require('express');
const ruta = require('ruta');
const app = express();
const PUERTO = proceso.env.PUERTO || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || '238911';
const MONGO_URI = process.env.MONGO_URI || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── BASE DE DATOS ───────────────────────────────────────────────────────────────
let col = null; // colección de participantes
let resCol = null; // colección de resultados

función asíncrona initDB() {
  if (!MONGO_URI) { console.log('Sin MONGO_URI — datos en memoria'); devolver; }
  intentar {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    esperar cliente.connect();
    const db = client.db('quiniela2026');
    col = db.collection('participantes');
    resCol = db.collection('results');
    await col.createIndex({ key: 1 }, { unique: true });
    console.log('MongoDB OK');
  } capturar (e) {
    console.error('Error de MongoDB:', e.message);
    col = null; resCol = null;
  }
}

// Alternativa en memoria
const memParticipantes = {};
let memResults = {};

function normKey(n) { return n.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40); }

función asíncrona getParticipant(clave) {
  si (col) {
    const doc = await col.findOne({ key });
    devolver documento || nulo;
  }
  devolver memParticipantes[clave] || null;
}

función asíncrona upsertParticipant(clave, datos) {
  si (col) {
    await col.replaceOne({ key }, { key, ...data }, { upsert: true });
  } demás {
    memParticipantes[clave] = datos;
  }
}

función asíncrona getAllParticipants() {
  si (col) {
    return col.find({}).toArray();
  }
  devolver Object.values(memParticipants);
}

función asíncrona getResults() {
  si (resCol) {
    const doc = await resCol.findOne({ _id: 'main' });
    devolver doc ? doc.data : {};
  }
  devolver resultados de memoria;
}

función asíncrona saveResults(data) {
  si (resCol) {
    await resCol.replaceOne({ _id: 'main' }, { _id: 'main', data }, { upsert: true });
  } demás {
    memResults = datos;
  }
}

// ── DATOS DE COINCIDENCIA ─────────────────────────────────────────────────────────────
const GRUPOS = [
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
    {h:"Escocia",hf:"🏴ڠڠڠڠڠڠ",a:"Haití",af:"🇭🇹",j:1,d:"13 Jun",hr:"14:00"},
    {h:"Brasil",hf:"🇧🇷",a:"Escocia",af:"🏴ceived
    {h:"Marruecos",hf:"🇲🇦",a:"Haití",af:"🇭🇹",j:2,d:"17 Jun",hr:"17:00"},
    {h:"Brasil",hf:"🇧🇷",a:"Haití",af:"🇭🇹",j:3,d:"21 Jun",hr:"20:00"},
    {h:"Marruecos",hf:"🇲🇦",a:"Escocia",af:"🏴ceived
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
    {h:"Senegal",hf:"🇸🇳",a:"Irak",af:"🇮🇶",j:2,d:"21 de junio",hr:"17:00"},
    {h:"Francia",hf:"🇫🇷",a:"Irak",af:"🇮🇶",j:3,d:"25 Jun",hr:"20:00"},
    {h:"Senegal",hf:"🇸🇳",a:"Noruega",af:"🇳🇴",j:3,d:"25 Jun",hr:"20:00"}]},
  {g:"J",t:"Argentina · Austria · Argelia · Jordania",m:[
    {h:"Argentina",hf:"🇦🇷",a:"Jordania",af:"🇯🇴",j:1,d:"17 Jun",hr:"20:00"},
    {h:"Austria",hf:"🇦🇹",a:"Argelia",af:"🇩🇿",j:1,d:"18 Jun",hr:"14:00"},
    {h:"Argentina",hf:"🇦🇷",a:"Austria",af:"🇦🇹",j:2,d:"22 Jun",hr:"14:00"},
    {h:"Argelia",hf:"🇩🇿",a:"Jordania",af:"🇯🇴",j:2,d:"22 Jun",hr:"17:00"},
    {h:"Argentina",hf:"🇦🇷",a:"Argelia",af:"🇩🇿",j:3,d:"26 Jun",hr:"20:00"},
    {h:"Austria",hf:"🇦🇹",a:"Jordania",af:"🇯🇴",j:3,d:"26 Jun",hr:"20:00"}]},
  {g:"K",t:"Portugal · Colombia · Uzbekistán · RD Congo",m:[
    {h:"Portugal",hf:"🇵🇹",a:"Colombia",af:"🇨🇴",j:1,d:"18 Jun",hr:"20:00"},
    {h:"Uzbekistán",hf:"🇺🇿",a:"Congo RD",af:"🇨🇩",j:1,d:"19 Jun",hr:"14:00"},
    {h:"Portugal",hf:"🇵🇹",a:"Uzbekistán",af:"🇺🇿",j:2,d:"23 Jun",hr:"14:00"},
    {h:"Colombia",hf:"🇨🇴",a:"Congo RD",af:"🇨🇩",j:2,d:"23 Jun",hr:"17:00"},
    {h:"Portugal",hf:"🇵🇹",a:"Congo RD",af:"🇨🇩",j:3,d:"27 Jun",hr:"20:00"},
    {h:"Colombia",hf:"🇨🇴",a:"Uzbekistán",af:"🇺🇿",j:3,d:"27 Jun",hr:"20:00"}]},
  {g:"L",t:"Inglaterra · Croacia · Panamá · Ghana",m:[
    {h:"Inglaterra",hf:"🏴ڠڠڠڠڠڠ",a:"Croacia",af:"🇭🇷",j:1,d:"20 Jun",hr:"14:00"},
    {h:"Panamá",hf:"🇵🇦",a:"Ghana",af:"🇬🇭",j:1,d:"20 Jun",hr:"17:00"},
    {h:"Inglaterra",hf:"🏴ڠڠڠڠڠڠ",a:"Panamá",af:"🇵🇦",j:2,d:"24 Jun",hr:"14:00"},
    {h:"Croacia",hf:"🇭🇷",a:"Ghana",af:"🇬🇭",j:2,d:"24 junio",hr:"17:00"},
    {h:"Inglaterra",hf:"🏴ڠڠڠڠڠڠ",a:"Ghana",af:"🇬🇭",j:3,d:"28 Jun",hr:"20:00"},
    {h:"Croacia",hf:"🇭🇷",a:"Panamá",af:"🇵🇦",j:3,d:"28 Jun",hr:"20:00"}]}
];

const TODOS_LOS_COINCIDENCIAS = [];
GRUPOS.forEach(g => gmforEach((m, i) => TODOS_COINCIDENCIAS.push({ ...m, id: gg + i })));

función calcPts(pred, res) {
  Si (!pred || !res) devuelve null;
  Si (pred.h === '' || pred.h == null || pred.a === '' || pred.a == null) devolver null;
  Si (res.h === '' || res.h == null || res.a === '' || res.a == null) devolver null;
  const ph = +pred.h, pa = +pred.a, rh = +res.h, ra = +res.a;
  si (isNaN(ph)||isNaN(pa)||isNaN(rh)||isNaN(ra)) devuelve nulo;
  si (ph===rh && pa===ra) devolver 3;
  const r = (a,b) => a>b?'H':a<b?'A':'E';
  devolver r(ph,pa)===r(rh,ra) ? 1 : 0;
}

// ── RUTAS ────────────────────────────────────────────────────────────────

app.get('/api/matches', (req, res) => res.json(GROUPS));

app.get('/api/health', async (req, res) => {
  const all = await getAllParticipants();
  const rez = await getResults();
  res.json({ ok:true, db: col?'MongoDB':'memory', participants:all.length, results:Object.keys(rez).length });
});

// Comprobar si el nombre existe
app.get('/api/check/:name', async (req, res) => {
  intentar {
    const key = normKey(req.params.name);
    const p = await getParticipant(key);
    res.json({ exists: !!p, createdAt: p ? p.createdAt : null });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Registrar nuevo participante con PIN
app.post('/api/register', async (req, res) => {
  intentar {
    const { nombre, pin } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'Nombre requerido' });
    if (!pin || !/^\d{5}$/.test(pin)) return res.status(400).json({ error: 'PIN debe ser de 5 dígitos' });
    const key = normKey(name.trim());
    const existente = esperar obtenerParticipante(clave);
    if (existente) return res.status(409).json({ error: 'Ese nombre ya está registrado', creadoAt: existiendo.createdAt });
    const newP = {
      nombre: nombre.trim(),
      alfiler,
      predicciones: {},
      creadoEn: nuevo Date().toISOString(),
      guardadoEn: new Date().toISOString()
    };
    esperar upsertParticipant(clave, nuevoP);
    res.json({ ok: true, key });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Iniciar sesión con nombre + PIN
app.post('/api/login', async (req, res) => {
  intentar {
    const { nombre, pin } = req.body;
    if (!name || !pin) return res.status(400).json({ error: 'Nombre y PIN requeridos' });
    const key = normKey(name.trim());
    const p = await getParticipant(key);
    if (!p) return res.status(404).json({ error: 'Nombre no encontrado' });
    if (p.pin !== pin) return res.status(401).json({ error: 'PIN incorrecto' });
    const { pin: _, ...safe } = p;
    res.json({ ok: true, participant: safe });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Guardar predicciones (requiere verificación mediante PIN)
app.post('/api/save', async (req, res) => {
  intentar {
    const { nombre, pin, predicciones } = req.body;
    if (!name || !pin) return res.status(400).json({ error: 'Nombre y PIN requeridos' });
    const key = normKey(name.trim());
    const p = await getParticipant(key);
    if (!p) return res.status(404).json({ error: 'Participante no encontrado' });
    if (p.pin !== pin) return res.status(401).json({ error: 'PIN incorrecto' });

    // Fusionar predicciones: nunca sobrescribir bloqueado
    const fusionado = { ...p.predicciones };
    si (predicciones && tipo de predicciones === 'objeto') {
      Objeto.claves(predicciones).paraCada(id => {
        si (!merged[id] || !merged[id].locked) {
          fusionado[id] = predicciones[id];
        }
      });
    }

    esperar upsertParticipant(clave, {
      ...pag,
      predicciones: fusionadas,
      guardadoEn: new Date().toISOString()
    });

    const locked = Object.values(merged).filter(x => x && x.locked).length;
    const filled = Object.values(merged).filter(x => x && xh !== '' && xa !== '').length;
    res.json({ ok: true, filled, locked });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Clasificación (pública)
app.get('/api/leaderboard', async (req, res) => {
  intentar {
    const all = await getAllParticipants();
    const rez = await getResults();
    const filas = all.map(p => {
      const preds = p.predictions || {};
      sea ​​pts=0, exacto=0, lleno=0, bloqueado=0;
      TODOS_LOS_COINCIDENCIAS.paraCada(m => {
        const pred = preds[m.id];
        const r = rez[m.id];
        si (pred && pred.h!=='' && pred.a!=='') lleno++;
        si (pred && pred.locked) bloqueado++;
        const pt = calcPts(pred, r);
        if (pt !== null) { pts += pt; if (pt===3) exact++; }
      });
      return { name: p.name, pts, exact, filled, locked, savedAt: p.savedAt };
    });
    filas.ordenar((a,b) => b.pts-a.pts || b.exact-a.exact || b.locked-a.locked);
    res.json({ filas, resultsCount: Object.keys(rez).length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Administrador: verificar contraseña
app.post('/api/admin-verify', (req, res) => {
  res.json({ ok: req.body.password === ADMIN_PASS });
});

// Administrador: obtener todos los datos
app.get('/api/admin/data', async (req, res) => {
  const auth = req.headers['x-admin-pass'];
  if (auth !== ADMIN_PASS) return res.status(403).json({ error: 'No autorizado' });
  intentar {
    const all = await getAllParticipants();
    const rez = await getResults();
    const safe = all.map(({ pin, ...rest }) => rest);
    res.json({ participantes: seguro, resultados: rez });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Administrador: guardar resultados oficiales
app.post('/api/results', async (req, res) => {
  const { contraseña, resultados: nuevosResultados } = req.body;
  if (password !== ADMIN_PASS) return res.status(403).json({ error: 'No autorizado' });
  intentar {
    esperar a guardarResultados(nuevosResultados || {});
    res.json({ ok: true, count: Object.keys(newResults||{}).length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`Quiniela Doña Corneta — puerto ${PORT} — DB: ${col?'MongoDB':'memoria'}`));
});
