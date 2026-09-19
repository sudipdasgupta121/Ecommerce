import path from "node:path";
import express from "express";
import { createApp } from "./app.js";

const distDir = path.join(import.meta.dirname, "..", "dist");
const port = process.env.PORT || 3000;

const app = createApp();

app.use(express.static(distDir));

// SPA fallback: any route not matched by a static file or /api route is a
// client-side react-router route, so always hand back index.html and let the client render it.
app.use((req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
