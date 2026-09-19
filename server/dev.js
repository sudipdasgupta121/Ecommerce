import { readFile } from "node:fs/promises";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { createApp } from "./app.js";

const port = process.env.PORT || 3000;
const root = path.join(import.meta.dirname, "..");

async function main() {
  const app = createApp();
  const vite = await createViteServer({
    root,
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  // SPA fallback, transformed through Vite so HMR's client script gets injected.
  app.use(async (req, res, next) => {
    try {
      const template = await readFile(path.join(root, "index.html"), "utf-8");
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (err) {
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });

  app.listen(port, () => {
    console.log(`Dev server listening at http://localhost:${port}`);
  });
}

main();
