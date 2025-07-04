import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';

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
    return {};
  }
}

app.get("/api/equipos", (req, res) => {
  readDatabase()
    .then(data => res.json(data.equipos || []))
    .catch(err => res.status(500).send(`Error reading database ${err.message}`));
});

app.get("/api/mentores", (req, res) => {
  readDatabase()
    .then(data => res.json(data.mentores || []))
    .catch(err => res.status(500).send(`Error reading database ${err.message}`));
});

app.post("/api/equipos", (req, res) => {
  res.send("Welcome to the API!");
});

app.post("/api/mentores", (req, res) => {
  res.send("Welcome to the API!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});