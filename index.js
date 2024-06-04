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
            content: "These are the accessibility issues identified after a scan of the website. Please provide two lists: one for the violations and the other for the solutions. The recommendations should align with the overall design and feel of the website, without suggesting drastic changes that alter its core aesthetic or functionality. Be clear and concise, avoiding repetition, and ensure each point is easily understandable. Each violation should have a corresponding, practical solution with no mismatch between the issues and their remedies. Use clear and organized language for both lists to ensure readability. Address exactly six issues per scan to keep the feedback manageable and actionable. Focus on feasible and effective solutions that can be implemented without extensive redesigns or overhauls. For example, if there is insufficient color contrast in the header text, the corresponding solution would be to increase the color contrast to meet WCAG guidelines. If images are missing alt text, the solution should be to add descriptive alt text for all images. If form fields are not labeled properly, the solution would be to properly label all form fields with clear and concise labels. If links are not clearly distinguishable, the solution should ensure all links are distinguishable through color, underline, or both. If there is an inconsistent navigation structure, the solution would be to standardize the navigation structure across all pages for consistency. If dynamic content updates are not announced to screen readers, the solution would be to implement ARIA live regions to announce these updates." + scan,
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
