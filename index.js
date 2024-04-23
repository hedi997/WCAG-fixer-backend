import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Server start
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
