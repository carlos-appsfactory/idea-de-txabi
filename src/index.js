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
const app = express();

app.use(express.json());
app.use(cors());

async function readDatabase() {
  try {
    const data = await fs.readFile(db, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return err;
  }
}

async function writeDatabase(data) {
  try {
    await fs.writeFile(db, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error writing to database:", err);
    return false;
  }
}

app.get("/api/equipos", (req, res) => {
  readDatabase()
    .then(data => res.json(data.equipos))
    .catch(err => res.status(500).send(`Error reading database; ${err.message}`));
});

app.get("/api/mentores", (req, res) => {
  readDatabase()
    .then(data => res.json(data.mentores))
    .catch(err => res.status(500).send(`Error reading database; ${err.message}`));
});

app.post("/api/equipos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || isNaN(id) || id <= 0 || id > 4) {
    return res.status(400).send("El ID del equipo debe ser un numero entre 1 y 4");
  }

  const mentores = req.body;
  if (!Array.isArray(mentores) || mentores.length < 3 || mentores.length > 3) {
    return res.status(400).send("Los mentores favoritos deben ser exactamente 3.");
  }

  mentores.forEach(mentor => {
    if (isNaN(mentor) || mentor <= 0 || mentor > 4) {
      return res.status(400).send("Los mentores deben ser numeros entre 0 y 4.");
    }
  });

  if (new Set(mentores).size !== mentores.length) {
    return res.status(400).send("Los mentores no deben repetirse.");
  }

  readDatabase().then(data => {
    const index = data.equipos.findIndex(equipo => equipo.id === id);

    data.equipos[index].mentores = mentores;

    writeDatabase(data)
      .then(() => res.status(201).json(data.equipos[index]))
      .catch(err => res.status(500).send(`Error writing to database: ${err.message}`));

  }).catch(err => res.status(500).send(`Error reading database: ${err.message}`));
});

app.post("/api/mentores/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || isNaN(id) || id <= 0 || id > 4) {
    return res.status(400).send("El ID del mentor debe ser un numero entre 1 y 4");
  }

  const equipos = req.body;
  if (!Array.isArray(equipos) || equipos.length < 3 || equipos.length > 3) {
    return res.status(400).send("Los mentores favoritos deben ser exactamente 3.");
  }

  equipos.forEach(equipo => {
    if (isNaN(equipo) || equipo <= 0 || equipo > 4) {
      return res.status(400).send("Los equipos deben ser numeros entre 0 y 4.");
    }
  });

  if (new Set(equipos).size !== equipos.length) {
    return res.status(400).send("Los equipos no deben repetirse.");
  }

  readDatabase().then(data => {
    const index = data.mentores.findIndex(mentor => mentor.id === id);

    data.mentores[index].equipos = equipos;

    writeDatabase(data)
      .then(() => res.status(201).json(data.mentores[index]))
      .catch(err => res.status(500).send(`Error writing to database: ${err.message}`));

  }).catch(err => res.status(500).send(`Error reading database: ${err.message}`));
});

app.get("/api/matching", async (req, res) => {
  try {
    console.log("Matching endpoint hit");
    const result = await runMatching();

    // ruta donde guardaremos
    const resultadosFile = path.join(__dirname, "resultados.json");

    // lo escribimos sobreescribiendo si existe
    await fs.writeFile(resultadosFile, JSON.stringify(result, null, 2), "utf8");

    res.json(result);
  } catch (err) {
    res.status(500).send(`Error ejecutando matching: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

