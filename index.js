require("dotenv").config();

const express = require("express");
const Groq = require("groq-sdk");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// get all breeds
async function getAllBreeds() {
  const res = await fetch("https://dog.ceo/api/breeds/list/all");
  const data = await res.json();
  return Object.keys(data.message);
}

// get image
async function getRandomImage(breed) {
  const res = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
  const data = await res.json();
  return data.message;
}

app.get("/dog", async (req, res) => {
  try {
    const breeds = await getAllBreeds();

    // use Groq to pick a breed
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Pick ONE random dog breed from this list and return ONLY the name in lowercase: ${breeds.join(", ")}`,
        },
      ],
    });

    const breed = completion.choices[0].message.content.trim().toLowerCase();

    const image = await getRandomImage(breed);

       res.setHeader("Content-Type", "text/plain");
    res.send(
`
breed: ${breed}
image: ${image}
`
    );

  } catch (err) {
    res.status(500).send(`error: ${err.message}`);
  }
});

app.listen(3000, () => {
  console.log("http://localhost:3000/dog");
});