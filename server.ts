import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getSmartSlicingInfo, searchModels, chatReply } from "./src/lib/gemini";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI endpoints — the Gemini key lives only on the server. The browser used
  // to import src/lib/gemini directly while vite.config inlined the key into
  // the client bundle, so every visitor could extract and abuse it. The
  // client now calls these via src/lib/aiClient.ts.
  app.post("/api/ai/slicing", async (req, res) => {
    try {
      res.json(await getSmartSlicingInfo(req.body.modelName, req.body.geometryInfo));
    } catch (error) {
      console.error("AI slicing failed:", error);
      res.status(500).json({ error: "AI slicing failed" });
    }
  });

  app.post("/api/ai/search", async (req, res) => {
    try {
      res.json({ text: await searchModels(req.body.query) });
    } catch (error) {
      console.error("AI search failed:", error);
      res.status(500).json({ error: "AI search failed" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const history = Array.isArray(req.body.history) ? req.body.history : [];
      res.json({ text: await chatReply(history, req.body.message) });
    } catch (error) {
      console.error("AI chat failed:", error);
      res.status(500).json({ error: "AI chat failed" });
    }
  });

  // The old /api/thingiverse/search proxy was removed: no client code called
  // it, it interpolated the query into the upstream URL unencoded, and as an
  // unauthenticated endpoint it let anyone who could reach this server spend
  // the owner's THINGIVERSE_TOKEN.

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
