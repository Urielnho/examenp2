import db from '../db.js';

export async function getAllItems() {
  const [rows] = await db.query("SELECT * FROM items WHERE status != 'returned' ORDER BY date DESC");
  return rows;
}

export async function getItemById(id) {
  const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [id]);
  if (!rows.length) throw new Error('Item no encontrado');
  return rows[0];
}

export async function searchItems({ status, category, query } = {}) {
  let sql = "SELECT * FROM items WHERE status != 'returned'";
  const params = [];

  if (status)   { sql += ' AND status = ?';   params.push(status); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (query) {
    sql += ' AND (name LIKE ? OR description LIKE ? OR location LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  sql += ' ORDER BY date DESC';
  const [rows] = await db.query(sql, params);
  return rows;
}

export async function createItem(item) {
  const { id, name, category, categoryLabel, status, primaryColor, brand,
          description, date, location, locationContext, imageUrl, reportedBy, reportedEmail } = item;

  if (!id || !name || !category || !status) {
    throw new Error('Campos requeridos: id, name, category, status');
  }

  await db.query(
    `INSERT INTO items
       (id,name,category,categoryLabel,status,primaryColor,brand,description,date,location,locationContext,imageUrl,reportedBy,reportedEmail)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, name, category, categoryLabel, status, primaryColor, brand,
     description, date, location, locationContext, imageUrl, reportedBy, reportedEmail]
  );
  return { id };
}

export async function updateItem(id, fields) {
  const allowed = ['name','category','categoryLabel','status','primaryColor',
                   'brand','description','date','location','locationContext','imageUrl',
                   'reportedBy','reportedEmail'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (!updates.length) throw new Error('No hay campos válidos para actualizar');

  const sql = `UPDATE items SET ${updates.map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
  const [result] = await db.query(sql, [...updates.map(k => fields[k]), id]);
  if (!result.affectedRows) throw new Error('Item no encontrado');
  return { updated: true };
}

export async function deleteItem(id) {
  const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);
  if (!result.affectedRows) throw new Error('Item no encontrado');
  return { deleted: true };
}
