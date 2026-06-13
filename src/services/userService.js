import db from '../db.js';

export async function getAllUsers() {
  const [rows] = await db.query(
    'SELECT id, name, email, role, status, imageUrl FROM users'
  );
  return rows;
}

export async function getUserById(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, role, status, imageUrl FROM users WHERE id = ?', [id]
  );
  if (!rows.length) throw new Error('Usuario no encontrado');
  return rows[0];
}

export async function createUser(user) {
  const { id, name, email, role, status, imageUrl } = user;

  if (!id || !name || !email) {
    throw new Error('Campos requeridos: id, name, email');
  }

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) throw new Error('El correo ya está registrado');

  await db.query(
    'INSERT INTO users (id,name,email,role,status,imageUrl) VALUES (?,?,?,?,?,?)',
    [id, name, email, role || 'user', status || 'active', imageUrl || null]
  );
  return { id };
}

export async function updateUser(id, fields) {
  const allowed = ['name', 'imageUrl', 'role'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (!updates.length) throw new Error('No hay campos válidos para actualizar');

  const sql = `UPDATE users SET ${updates.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
  const [result] = await db.query(sql, [...updates.map(k => fields[k]), id]);
  if (!result.affectedRows) throw new Error('Usuario no encontrado');
  return { updated: true };
}

export async function toggleUserStatus(id) {
  const [rows] = await db.query('SELECT status FROM users WHERE id = ?', [id]);
  if (!rows.length) throw new Error('Usuario no encontrado');
  const next = rows[0].status === 'active' ? 'suspended' : 'active';
  await db.query('UPDATE users SET status = ? WHERE id = ?', [next, id]);
  return { status: next };
}

export async function deleteUser(id) {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  if (!result.affectedRows) throw new Error('Usuario no encontrado');
  return { deleted: true };
}
