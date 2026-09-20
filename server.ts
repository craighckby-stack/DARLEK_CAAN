/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-70 [2026-09-20T05:32:37.810Z] */
import express from 'express';
import http from 'http';
import path from 'path';
import { apiRoutes } from './src/api-routes.ts';
import { NextRequest } from './src/lib/next-mock.ts';

async function createNextMockRequest(req: express.Request): Promise<any> {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const reqHeaders = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach(v => reqHeaders.append(key, v));
    } else if (value) {
      reqHeaders.append(key, value);
    }
  }

  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = req.body;
  }
  
  const nextReq = new NextRequest(url.toString(), {
    method: req.method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (body) {
    (nextReq as any).json = async () => body;
  }
  
  return nextReq;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json({ limit: '50mb' }));

  for (const [routeUrl, routeModule] of Object.entries(apiRoutes)) {
    app.all(routeUrl, async (req, res) => {
      try {
        const method = req.method.toUpperCase();
        if (typeof (routeModule as any)[method] === 'function') {
          const nextReq = await createNextMockRequest(req);
          const nextRes = await (routeModule as any)[method](nextReq);
          
          if (nextRes instanceof Response) {
            nextRes.headers.forEach((val: string, key: string) => res.setHeader(key, val));
            const status = nextRes.status;
            const text = await nextRes.text();
            res.status(status).send(text);
          } else {
             res.status(500).send("Endpoint did not return a Response object");
          }
        } else {
          res.status(405).send("Method Not Allowed");
        }
      } catch (err: any) {
        console.error(`Error executing ${routeUrl}:`, err);
        res.status(500).json({ error: err.message || String(err) });
      }
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 70,
  timestamp: "2026-09-20T05:32:37.810Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});
