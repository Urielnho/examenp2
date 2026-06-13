import db from '../db.js';

export async function getLogs(limit = 50) {
  const [rows] = await db.query(
    `SELECT id, user, action, itemCategory,
            DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS time,
            status
     FROM activity_logs
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function createLog(log) {
  const { id, user, action, itemCategory, time, status } = log;

  if (!id || !user || !action) {
    throw new Error('Campos requeridos: id, user, action');
  }

  await db.query(
    'INSERT INTO activity_logs (id,user,action,itemCategory,time,status) VALUES (?,?,?,?,?,?)',
    [id, user, action, itemCategory || null, time || 'Ahora', status || 'Pending']
  );
  return { id };
}

export async function deleteLog(id) {
  const [result] = await db.query('DELETE FROM activity_logs WHERE id = ?', [id]);
  if (!result.affectedRows) throw new Error('Log no encontrado');
  return { deleted: true };
}

export async function clearLogs() {
  await db.query('DELETE FROM activity_logs');
  return { cleared: true };
}
