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
      res.status(500).json({ error: "An error occurred while testing the URL" });
    }
  }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/scanner", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: "Invalid URL" });
  } else {
    try {
      const results = await pa11y(url);
      const scan = JSON.stringify(results);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "These are the accessibility issues after a scan, could you please give me 2 lists. So one is the violations and the other is solution. The violations should only tell the user about the violations, nothing else. and the solution should be the answer for the violations. i want you to use bullet points everytime for the solutions that are possible and for every violation. so each bullet point has a solution and a violation. be clear and concise and dont repeat anything twice. so each violation should always have a solution in the solution list that you are providing. so if user has bad accessibility on the header, you tell the user about that in the solution. and keep it the same for everything else." + scan,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      const answer = completion.choices[0].message.content;

      // Log the response to debug
      console.log("OpenAI response:", answer);

      // Split content into violations and solutions
      const splitContent = answer.split('**Solutions:**');

      // Check if splitContent has two parts
      if (splitContent.length < 2) {
        throw new Error("Unexpected response format from OpenAI");
      }

      const violationsContent = splitContent[0].replace('**Violations:**', '').trim();
      const solutionsContent = splitContent[1].trim();

      res.json({
        role: "assistant",
        title: "Violations and Solutions",
        content: {
          violations: violationsContent,
          solutions: solutionsContent,
        },
      });
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "An error occurred while processing the request" });
    }
  }
});

// Server start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const myEnvKey = process.env.MY_ENV_KEY;
console.log(myEnvKey);
