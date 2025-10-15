import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log unhandled errors to keep preview alive
process.on('unhandledRejection', (reason) => {
  log(`unhandledRejection: ${String(reason)}`);
});
process.on('uncaughtException', (err) => {
  log(`uncaughtException: ${err.message}`);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Healthcheck for load balancer and preview
app.get('/health', (_req, res) => res.status(200).send('ok'));

(async () => {
  let server: Server;
  try {
    server = await registerRoutes(app);
  } catch (e) {
    log(`routes setup failed: ${(e as Error).message}`, "routes");
    // Minimal fallback so preview still loads
    app.get("/", (_req, res) => {
      res
        .status(200)
        .send(
          "<!doctype html><html><head><meta charset=\"utf-8\"><title>Peneira Fácil</title></head><body><h1>Servidor em execução</h1><p>Rotas indisponíveis no momento.</p></body></html>"
        );
    });
    server = createServer(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Do not throw here; let the server keep running so the preview survives
  });

  // Always try to start Vite dev server for the preview; fallback to static
  try {
    await setupVite(app, server);
  } catch (e) {
    log(`vite setup failed, trying static: ${(e as Error).message}`, "vite");
    try {
      serveStatic(app);
    } catch (err) {
      log(`static fallback failed: ${(err as Error).message}`, "static");
      app.get("*", (_req, res) => {
        res
          .status(200)
          .send(
            "<!doctype html><html><head><meta charset=\"utf-8\"><title>Peneira Fácil</title></head><body><h1>Servidor em execução</h1><p>Falha ao iniciar Vite e estático. Tente recarregar.</p></body></html>"
          );
      });
    }
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
