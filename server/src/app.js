const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Our API is always called from a different origin (Vercel frontend ->
// Render backend), so Helmet's default same-origin resource policy would
// block any endpoint that serves media/files directly (e.g. the video/image
// streaming proxy below). Cross-origin embedding is exactly what we need.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CLIENT_ORIGIN can be a comma-separated list (e.g. your custom domain +
// localhost for local dev). On top of that, ANY *.vercel.app subdomain is
// always allowed - Vercel gives every deployment (production and every
// preview) a different URL, so hardcoding just one would break on the next
// deploy. This keeps things working without having to update env vars here
// every time Vercel generates a new URL.
const explicitAllowedOrigins = (env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // non-browser requests (curl, health checks, server-to-server)
      if (explicitAllowedOrigins.includes(origin)) return callback(null, true);
      try {
        const hostname = new URL(origin).hostname;
        if (hostname.endsWith('.vercel.app')) return callback(null, true);
      } catch {
        // fall through to rejection below
      }
      return callback(new Error(`Origin "${origin}" is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 300 });
app.use('/api', limiter);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
