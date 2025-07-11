import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
import { runMatching } from "./matching.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const db = path.join(__dirname, 'db.json');
const max_equipos = 4;
const max_mentores = 4;
const num_votaciones = 4;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/equipos", (req, res) => {
  fs.readFile(db, 'utf8')
    .then(data => JSON.parse(data))
    .then(data => res.json(data.equipos))
    .catch(err => { throw new Error(`Error reading database: ${err.message}`) });
});

app.get("/api/equipos/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id) || id <= 0 || id > max_equipos) {
    return res.status(400).send(`El ID del equipo debe ser un numero entre 1 y ${max_equipos}`);
  }

  try {
    const content = await fs.readFile(db, 'utf8');
    const data = JSON.parse(content);

    const equipo = data.equipos.find(e => e.id === id);

    if (!equipo) {
      return res.status(404).send(`Equipo con ID ${id} no encontrado.`);
    }

    res.status(200).json(equipo);

  } catch (err) {
    res.status(500).send(`Error leyendo base de datos: ${err.message}`);
  }
});

app.post("/api/equipos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || isNaN(id) || id <= 0 || id > max_equipos) {
    return res.status(400).send(`El ID del equipo debe ser un numero entre 1 y ${max_equipos}`);
  }

  const mentores = req.body;  
  if (!Array.isArray(mentores) || mentores.length !== num_votaciones) {
    return res.status(400).send(`Los mentores favoritos deben ser exactamente ${num_votaciones}.`);
  }

  if (mentores.some(mentor => isNaN(mentor) || mentor <= 0 || mentor > max_mentores)) {
    return res.status(400).send(`Los mentores deben ser números entre 1 y ${max_mentores}.`);
  }

  if (new Set(mentores).size !== mentores.length) {
    return res.status(400).send("Los mentores no deben repetirse.");
  }

  try {
    const content = await fs.readFile(db, 'utf8');
    const data = JSON.parse(content);

    const equipo = data.equipos.find(e => e.id === id);

    if (!equipo) {
      return res.status(404).send(`Equipo con ID ${id} no encontrado.`);
    }

    equipo.mentores = mentores;

    await fs.writeFile(db, JSON.stringify(data, null, 2), 'utf8');

    res.status(200).json(equipo);

  } catch (err){
    return res.status(500).send(`Error al guardar: ${err.message}`);
  }
});

app.get("/api/mentores", (req, res) => {
  fs.readFile(db, 'utf8')
    .then(data => JSON.parse(data))
    .then(data => res.json(data.mentores))
    .catch(err => { throw new Error(`Error reading database: ${err.message}`) });
});

app.get("/api/mentores/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id) || id <= 0 || id > max_mentores) {
    return res.status(400).send(`El ID del mentor debe ser un numero entre 1 y ${max_mentores}`);
  }

  try {
    const content = await fs.readFile(db, 'utf8');
    const data = JSON.parse(content);
    const mentor = data.mentores.find(e => e.id === id);

    if (!mentor) {
      return res.status(404).send(`Mentor con ID ${id} no encontrado.`);
    }

    res.status(200).json(mentor);

  } catch (err) {
    res.status(500).send(`Error leyendo base de datos: ${err.message}`);
  }
});

app.post("/api/mentores/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id) || id <= 0 || id > 4) {
    return res.status(400).send(`El ID del mentor debe ser un numero entre 1 y ${max_mentores}`);
  }

  const equipos = req.body;
  if (!Array.isArray(equipos) || equipos.length !== num_votaciones) {
    return res.status(400).send(`Los equipos favoritos deben ser exactamente ${num_votaciones}.`);
  }

  if (equipos.some(equipo => isNaN(equipo) || equipo <= 0 || equipo > max_equipos)) {
    return res.status(400).send(`Los equipos deben ser números entre 1 y ${max_equipos}.`);
  }

  if (new Set(equipos).size !== equipos.length) {
    return res.status(400).send("Los equipos no deben repetirse.");
  }

  try {
    const content = await fs.readFile(db, 'utf8');
    const data = JSON.parse(content);

    const mentor = data.mentores.find(e => e.id === id);

    if (!mentor) {
      return res.status(404).send(`Mentor con ID ${id} no encontrado.`);
    }

    mentor.equipos = equipos;

    await fs.writeFile(db, JSON.stringify(data, null, 2), 'utf8');

    res.status(200).json(mentor)

  } catch (err) {
    return res.status(500).send(`${err.message}`);
  }
});

app.get("/api/matching", async (req, res) => {
  try {
    console.log("Matching endpoint hit");
    const result = await runMatching();

    // ruta donde guardaremos
    const resultadosFile = path.join(__dirname, "resultados.json");

    // lo escribimos sobreescribiendo si existe

    try {
      console.log(resultadosFile);
      await fs.writeFile(resultadosFile, JSON.stringify(result, null, 2), "utf8");
    } catch (writeErr) {
      console.error("Error al escribir el archivo:", writeErr.message);
    }


    //await fs.writeFile(resultadosFile, JSON.stringify(result, null, 2), "utf8");

    res.json(result);    
  } catch (err) {
    res.status(500).send(`Error ejecutando matching: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

