/* eslint-disable no-undef */
import axios from "axios";

const API_URL = process.env.VITE_API_URLL || "http://localhost:5000/api";

const TAGS = [
  "Racing",
  "Arcade",
  "Cyberpunk",
  "RPG",
  "Adventure",
  "Story",
  "Puzzle",
  "Cozy",
  "Simulation",
  "Horror",
  "Sci-Fi",
  "Strategy",
  "Turn-Based",
  "Fantasy",
  "Casual",
  "Indie",
];

const createTag = async (name) => {
  const res = await axios.post(`${API_URL}/GameTags`, { name });
  return res.data;
};

const seedTags = async () => {
  const results = await Promise.allSettled(TAGS.map(createTag));

  console.log("Done");
  console.log(
    "Success:",
    results.filter((r) => r.status === "fulfilled").length,
  );
  console.log("Failed:", results.filter((r) => r.status === "rejected").length);
};

seedTags();
