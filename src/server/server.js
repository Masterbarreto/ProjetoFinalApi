import express from 'express';
import cors from 'cors';
import "dotenv/config";
import morgan from "morgan";
import store from '../store.js';
import routes from '../routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/', routes);

// ESP32 polling endpoint — returns next queued command (select/release)
// Supports query params: ?mode=pop|peek  (default pop), ?ttl=SECONDS to expire old commands
app.get('/esp32/next', (req, res) => {
  const mode = req.query.mode || 'pop';
  const ttl = req.query.ttl ? Number(req.query.ttl) : 0;
  const cmd = store.popEsp32Command({ mode, ttlSeconds: ttl });
  if (!cmd) return res.status(204).end();
  return res.json(cmd);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});