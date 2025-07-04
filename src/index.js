import express from "express";
import cors from "cors";

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});