import bodyParser from "body-parser";
import express from "express";
import pa11y from "pa11y";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5009;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// create a route
app.get("/pa11y/test", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: "Invalid URL" });
  } else {
    try {
      const results = await pa11y(url);
      res.status(200).json(results);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while testing the URL" });
    }
  }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/scanner", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: "Invalid URL" });
  } else {
    const results = await pa11y(url);
    const scan = JSON.stringify(results);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "These are the accesibility issues after a scan, could you make a list with the context and messages and add a solution to each one" +
            scan,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const answer = completion.choices[0].message;
    res.send(answer);
  }
});

// Server start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
