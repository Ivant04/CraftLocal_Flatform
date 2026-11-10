// Test-only entrypoint: mount production public routes without enabling any database writes.
import fs from 'node:fs';
import { registerHooks, createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const requireFrontend = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { transformSync } = requireFrontend('esbuild');
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context); }
    catch (error) {
      if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
  load(url, context, nextLoad) {
    if (!url.endsWith('.ts')) return nextLoad(url, context);
    return { format: 'module', shortCircuit: true, source: transformSync(fs.readFileSync(fileURLToPath(url), 'utf8'), { loader: 'ts', format: 'esm', target: 'node22' }).code };
  },
});

try {
  await mongoose.connect(process.env.MONGO_URI, { autoCreate: false, autoIndex: false, serverSelectionTimeoutMS: 10000 });
  await import('../src/models/user.model.ts');
  const { default: workshops } = await import('../src/routes/workshop.routes.ts');
  const { getWorkshopReviews } = await import('../src/controllers/review.controller.ts');
  const { default: categories } = await import('../src/routes/category.routes.ts');
  const { errorMiddleware } = await import('../src/middlewares/error.middleware.ts');
  const app = express();
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
  app.use((req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return res.status(405).json({ success: false, message: 'Live verification is read-only' });
    next();
  });
  app.get('/api/health', (_req, res) => res.json({ success: true, mode: 'live-readonly-test', databaseConnected: mongoose.connection.readyState === 1 }));
  app.use('/api/workshops', workshops);
  app.use('/api/categories', categories);
  app.get('/api/reviews/workshop/:workshopId', getWorkshopReviews);
  app.use(errorMiddleware);
  const port = Number(process.env.PORT || 5000);
  const server = app.listen(port, '127.0.0.1', () => console.log(`Read-only test API listening on localhost:${port}; MongoDB connected; automatic index/create disabled`));
  async function stop() { server.close(); await mongoose.disconnect(); process.exit(0); }
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
} catch (error) {
  console.error(`Read-only test server failed: ${error.name} (${error.code || 'no code'})`);
  await mongoose.disconnect();
  process.exitCode = 1;
}
