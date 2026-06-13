import db from '../db.js';

export async function login(email, password) {
  if (!email || !password) {
    throw new Error('Correo y contraseña son requeridos');
  }

  const [rows] = await db.query(
    'SELECT id, name, email, role, status FROM users WHERE email = ? AND password = ?',
    [email, password]
  );

  if (!rows.length) throw new Error('Credenciales inválidas');

  const user = rows[0];
  if (user.status === 'suspended') throw new Error('Cuenta suspendida');

  return { name: user.name, email: user.email, role: user.role };
}

export async function getUserByEmail(email) {
  if (!email) throw new Error('Correo requerido');

  const [rows] = await db.query(
    'SELECT id, name, email, role, status, imageUrl FROM users WHERE email = ?',
    [email]
  );
  if (!rows.length) throw new Error('Usuario no encontrado');
  return rows[0];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function register(name, email, password) {
  if (!name || !email || !password) {
    throw new Error('Nombre, correo y contraseña son requeridos');
  }
  if (!EMAIL_RE.test(email)) {
    throw new Error('El correo no tiene un formato válido');
  }
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) throw new Error('El correo ya está registrado');

  const id = `u-${Date.now()}`;
  await db.query(
    'INSERT INTO users (id, name, email, role, status, password) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, email, 'user', 'active', password]
  );

  return { name, email, role: 'user' };
}

export async function changePassword(id, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const [rows] = await db.query(
    'SELECT id FROM users WHERE id = ? AND password = ?',
    [id, currentPassword]
  );
  if (!rows.length) throw new Error('Contraseña actual incorrecta');

  await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
  return { updated: true };
}
