import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dev-server middleware plugin that emulates Vercel Serverless Function execution
 * for `/api/*` routes during local development without needing an Express server or Vercel CLI.
 */
function vercelApiDevPlugin() {
  return {
    name: 'vercel-serverless-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = parsedUrl.pathname;

        // Handle OPTIONS preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.end();
          return;
        }

        const cleanPath = pathname.replace(/\/$/, '');
        let handlerRelativePath = null;
        if (cleanPath === '/api/auth/register') {
          handlerRelativePath = 'api/auth/register.js';
        } else if (cleanPath === '/api/auth/login') {
          handlerRelativePath = 'api/auth/login.js';
        } else if (cleanPath === '/api/auth/me') {
          handlerRelativePath = 'api/auth/me.js';
        } else if (cleanPath === '/api/url/analyze') {
          handlerRelativePath = 'api/url/analyze.js';
        } else {
          // Dynamic fallback for any other files placed under api/
          const potentialPath = path.resolve(process.cwd(), `.${cleanPath}.js`);
          if (fs.existsSync(potentialPath)) {
            handlerRelativePath = `.${cleanPath}.js`;
          }
        }

        if (!handlerRelativePath) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: `API route ${pathname} not found` }));
          return;
        }

        try {
          // Read request body if present
          let body = null;
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            if (rawBody) {
              try {
                body = JSON.parse(rawBody);
              } catch {
                body = rawBody;
              }
            }
          }

          req.body = body;
          req.query = Object.fromEntries(parsedUrl.searchParams);

          // Add Vercel/Express helper functions to res for compatibility
          res.status = function (statusCode) {
            this.statusCode = statusCode;
            return this;
          };
          res.json = function (data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
            return this;
          };

          // Use absolute path and pathToFileURL so Node can resolve ESM correctly
          const absoluteScriptPath = path.isAbsolute(handlerRelativePath)
            ? handlerRelativePath
            : path.resolve(process.cwd(), handlerRelativePath);

          const fileUrl = pathToFileURL(absoluteScriptPath).href;
          const module = await import(fileUrl);
          const handler = module.default || module;
          await handler(req, res);
        } catch (error) {
          console.error(`Error in ${pathname}:`, error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              message: 'Internal server error in API route',
              error: error.message,
            }));
          }
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [vercelApiDevPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
