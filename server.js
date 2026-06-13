import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import express from 'express';
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), 'env', '.env') });

import * as itemService       from './src/services/itemService.js';
import * as moderationService from './src/services/moderationService.js';
import * as userService       from './src/services/userService.js';
import * as logService        from './src/services/logService.js';
import * as authService       from './src/services/authService.js';
import * as statsService      from './src/services/statsService.js';
import * as contactService    from './src/services/contactService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const API = process.env.API_PREFIX ?? '/equipo_02/api';

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const handle = fn => async (req, res) => {
  try {
    const result = await fn(req, res);
    res.json(result);
  } catch (e) {
    const status = e.message.includes('no encontrado') ? 404
                 : e.message.includes('requerido') || e.message.includes('registrado')
                   || e.message.includes('caracteres') || e.message.includes('válido')
                   || e.message.includes('corta') ? 400
                 : e.message.includes('inválidas') || e.message.includes('suspendida') ? 401
                 : 500;
    res.status(status).json({ error: e.message });
  }
};

// ----------------------------------------------------------------
// ITEMS
// ----------------------------------------------------------------
app.get(`${API}/items`, handle(req =>
  itemService.searchItems(req.query)
));

app.get(`${API}/items/:id`, handle(req =>
  itemService.getItemById(req.params.id)
));

app.post(`${API}/items`, handle(async req => {
  return itemService.createItem(req.body);
}));

app.put(`${API}/items/:id`, handle(req =>
  itemService.updateItem(req.params.id, req.body)
));

app.delete(`${API}/items/:id`, handle(req =>
  itemService.deleteItem(req.params.id)
));

// ----------------------------------------------------------------
// MODERATION
// ----------------------------------------------------------------
app.get(`${API}/moderation`, handle(() =>
  moderationService.getPendingItems()
));

app.get(`${API}/moderation/:id`, handle(req =>
  moderationService.getItemById(req.params.id)
));

app.post(`${API}/moderation`, handle(req =>
  moderationService.submitForModeration(req.body)
));

app.post(`${API}/moderation/:id/approve`, handle(req =>
  moderationService.approveItem(req.params.id)
));

app.delete(`${API}/moderation/:id`, handle(req =>
  moderationService.rejectItem(req.params.id)
));

// ----------------------------------------------------------------
// USERS
// ----------------------------------------------------------------
app.get(`${API}/users`, handle(() =>
  userService.getAllUsers()
));

app.get(`${API}/users/:id`, handle(req =>
  userService.getUserById(req.params.id)
));

app.post(`${API}/users`, handle(req =>
  userService.createUser(req.body)
));

app.put(`${API}/users/:id`, handle(req =>
  userService.updateUser(req.params.id, req.body)
));

app.put(`${API}/users/:id/toggle-status`, handle(req =>
  userService.toggleUserStatus(req.params.id)
));

app.delete(`${API}/users/:id`, handle(req =>
  userService.deleteUser(req.params.id)
));

// ----------------------------------------------------------------
// LOGS
// ----------------------------------------------------------------
app.get(`${API}/logs`, handle(req =>
  logService.getLogs(Number(req.query.limit) || 50)
));

app.post(`${API}/logs`, handle(req =>
  logService.createLog(req.body)
));

app.delete(`${API}/logs/:id`, handle(req =>
  logService.deleteLog(req.params.id)
));

// ----------------------------------------------------------------
// STATS
// ----------------------------------------------------------------
app.get(`${API}/stats`, handle(() =>
  statsService.getStats()
));

app.get(`${API}/stats/category`, handle(() =>
  statsService.getByCategory()
));

app.get(`${API}/stats/weekly`, handle(() =>
  statsService.getWeeklyTrend()
));

app.get(`${API}/stats/monthly`, handle(() =>
  statsService.getMonthlyTrend()
));

// ----------------------------------------------------------------
// MATCHES
// ----------------------------------------------------------------
// CONTACT
// ----------------------------------------------------------------
app.post(`${API}/contact`, handle(req =>
  contactService.saveMessage(req.body)
));

app.get(`${API}/contact`, handle(() =>
  contactService.getMessages()
));

app.get(`${API}/contact/my-claims`, handle(req =>
  contactService.getClaimsByEmail(req.query.email || '')
));

app.get(`${API}/contact/found-for-me`, handle(req =>
  contactService.getFoundReportsForOwner(req.query.email || '')
));

app.post(`${API}/contact/:id/confirm`, handle(req =>
  contactService.confirmDelivery(req.params.id, req.body.role || '')
));

app.post(`${API}/contact/:id/approve`, handle(req =>
  contactService.approveMessage(req.params.id)
));

app.post(`${API}/contact/:id/reject`, handle(req =>
  contactService.rejectMessage(req.params.id)
));

// ----------------------------------------------------------------
// AUTH
// ----------------------------------------------------------------
app.post(`${API}/auth/login`, handle(req =>
  authService.login(req.body.email, req.body.password)
));

app.post(`${API}/auth/register`, handle(req =>
  authService.register(req.body.name, req.body.email, req.body.password)
));

app.post(`${API}/auth/change-password`, handle(req => {
  const { id, currentPassword, newPassword } = req.body;
  return authService.changePassword(id, currentPassword, newPassword);
}));

// ----------------------------------------------------------------
// UPLOAD
// ----------------------------------------------------------------
app.post(`${API}/upload`, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });
  const pub = process.env.PUBLIC_PREFIX || API.replace(/\/api$/, '') || '/equipo_02';
  res.json({ url: `${pub}/uploads/${req.file.filename}` });
});

// ----------------------------------------------------------------
// SPA (React)
// ----------------------------------------------------------------
app.use('/equipo_02', express.static(path.join(__dirname, 'public')));
app.get('/equipo_02/*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3026;
app.listen(PORT, () => {
  console.log(`FindIt backend corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}${API}/`);
});
