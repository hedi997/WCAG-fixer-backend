import bodyParser from "body-parser";
import express from "express";
import pa11y from "pa11y";
import cors from "cors";

const app = express();
const port = 5009;

// Middleware
app.use(cors());

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

// Server start
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";

// const app = express();
// const port = 4000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Server start
// app.listen(port, () => {
//   console.log(`Bankens backend körs på http://localhost:${port}`);
// });
