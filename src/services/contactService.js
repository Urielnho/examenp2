import db from '../db.js';

await db.query(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id           VARCHAR(32)  PRIMARY KEY,
    name         VARCHAR(120) NOT NULL,
    email        VARCHAR(180) NOT NULL,
    subject      VARCHAR(255) DEFAULT '',
    message      TEXT         NOT NULL,
    item_id      VARCHAR(64)  DEFAULT NULL,
    finder_email VARCHAR(180) DEFAULT NULL,
    status       VARCHAR(20)  DEFAULT 'pending',
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  )
`);

// Agregar columnas nuevas si la tabla ya existía sin ellas
for (const alter of [
  "ALTER TABLE contact_messages ADD COLUMN item_id VARCHAR(64) DEFAULT NULL",
  "ALTER TABLE contact_messages ADD COLUMN finder_email VARCHAR(180) DEFAULT NULL",
  "ALTER TABLE contact_messages ADD COLUMN status VARCHAR(20) DEFAULT 'pending'",
  "ALTER TABLE contact_messages ADD COLUMN owner_confirmed TINYINT(1) DEFAULT 0",
  "ALTER TABLE contact_messages ADD COLUMN finder_confirmed TINYINT(1) DEFAULT 0",
]) {
  try { await db.query(alter); } catch {}
}

export async function saveMessage({ name, email, subject, message, item_id, finder_email }) {
  if (!name?.trim() || !email?.trim() || !message?.trim())
    throw new Error('Nombre, correo y mensaje son requeridos');
  const id = `msg-${Date.now()}`;
  await db.query(
    'INSERT INTO contact_messages (id, name, email, subject, message, item_id, finder_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name.trim(), email.trim(), subject?.trim() || '', message.trim(), item_id || null, finder_email || null]
  );
  return { id, ok: true };
}

export async function getMessages(limit = 50) {
  const [rows] = await db.query(
    `SELECT *, owner_confirmed = 1 AS owner_confirmed, finder_confirmed = 1 AS finder_confirmed
     FROM contact_messages ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function confirmDelivery(id, role) {
  if (!['owner', 'finder'].includes(role)) throw new Error('Rol inválido');
  const column = role === 'owner' ? 'owner_confirmed' : 'finder_confirmed';
  await db.query(`UPDATE contact_messages SET ${column} = 1 WHERE id = ?`, [id]);

  const [[msg]] = await db.query(
    'SELECT item_id, owner_confirmed, finder_confirmed FROM contact_messages WHERE id = ?', [id]
  );
  if (!msg) throw new Error('Mensaje no encontrado');

  const bothConfirmed = msg.owner_confirmed == 1 && msg.finder_confirmed == 1;
  if (bothConfirmed && msg.item_id) {
    await db.query("UPDATE items SET status = 'returned' WHERE id = ?", [msg.item_id]);
  }
  return { ok: true, both_confirmed: bothConfirmed };
}

export async function approveMessage(id) {
  const [[msg]] = await db.query('SELECT item_id FROM contact_messages WHERE id = ?', [id]);
  if (!msg) throw new Error('Mensaje no encontrado');

  await db.query("UPDATE contact_messages SET status = 'approved' WHERE id = ?", [id]);

  if (msg.item_id) {
    await db.query("UPDATE items SET status = 'returned' WHERE id = ?", [msg.item_id]);
  }

  return { ok: true };
}

export async function rejectMessage(id) {
  const [result] = await db.query("UPDATE contact_messages SET status = 'rejected' WHERE id = ?", [id]);
  if (!result.affectedRows) throw new Error('Mensaje no encontrado');
  return { ok: true };
}

export async function getClaimsByEmail(email) {
  const [rows] = await db.query(
    `SELECT id, name, subject, message, item_id, finder_email, status,
            owner_confirmed = 1 AS owner_confirmed,
            finder_confirmed = 1 AS finder_confirmed,
            DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS created_at
     FROM contact_messages
     WHERE email = ? AND item_id IS NOT NULL
     ORDER BY created_at DESC`,
    [email]
  );
  return rows;
}

export async function getFoundReportsForOwner(email) {
  const [rows] = await db.query(
    `SELECT id, name, email AS finder_name_email, subject, message, item_id, email AS finder_contact, status,
            owner_confirmed = 1 AS owner_confirmed,
            finder_confirmed = 1 AS finder_confirmed,
            DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS created_at
     FROM contact_messages
     WHERE finder_email = ? AND subject LIKE 'Reporte de hallazgo:%'
     ORDER BY created_at DESC`,
    [email]
  );
  return rows;
}
