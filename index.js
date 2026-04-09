require("dotenv").config();
const express = require("express");
const Groq = require("groq-sdk");

const app = express();
const cors = require("cors");
app.use(cors());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.static("public"));

app.get("/", async (req, res) => {
  const breedsRes = await fetch("https://dog.ceo/api/breeds/list/all");
  const breedsData = await breedsRes.json();
  const breeds = Object.keys(breedsData.message);

  const pickBreed = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Here is a list of dog breeds: ${breeds.join(", ")}. Pick one at random and reply with ONLY the breed name, nothing else.`,
      },
    ],
  });

  const breed = pickBreed.choices[0].message.content.trim().toLowerCase();

  const imgRes = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
  const imgData = await imgRes.json();
  const imageUrl = imgData.message;


  res.setHeader("Content-Type", "text/plain");
  res.send(`Breed : ${breed}\nImage : ${imageUrl}\n`);
});

// Keep this for local dev
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Running on port ${PORT}`));
}

// This is what Vercel needs
module.exports = app;