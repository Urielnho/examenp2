import db from '../db.js';

export async function getPendingItems() {
  const [rows] = await db.query(
    "SELECT * FROM moderation_items WHERE status = 'pending' ORDER BY date DESC"
  );
  return rows;
}

export async function getItemById(id) {
  const [rows] = await db.query('SELECT * FROM moderation_items WHERE id = ?', [id]);
  if (!rows.length) throw new Error('Item de moderación no encontrado');
  return rows[0];
}

export async function submitForModeration(item) {
  const {
    id, name, category, categoryLabel, status: item_status,
    description, date, location, locationContext,
    reportedBy, reportedEmail, imageUrl, primaryColor, brand
  } = item;

  if (!id || !name || !reportedBy || !reportedEmail) {
    throw new Error('Campos requeridos: id, name, reportedBy, reportedEmail');
  }

  await db.query(
    `INSERT INTO moderation_items
       (id,name,category,categoryLabel,item_status,status,description,date,location,locationContext,reportedBy,reportedEmail,imageUrl,primaryColor,brand)
     VALUES (?,?,?,?,?,'pending',?,?,?,?,?,?,?,?,?)`,
    [id, name, category, categoryLabel, item_status || 'lost',
     description, date, location, locationContext,
     reportedBy, reportedEmail, imageUrl, primaryColor, brand]
  );
  return { id };
}

export async function approveItem(id) {
  const [rows] = await db.query('SELECT * FROM moderation_items WHERE id = ?', [id]);
  if (!rows.length) throw new Error('Item no encontrado');
  const m = rows[0];

  await db.query(
    `INSERT IGNORE INTO items
       (id,name,category,categoryLabel,status,primaryColor,brand,description,date,location,locationContext,imageUrl,reportedBy,reportedEmail)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      `item-from-mod-${m.id}`,
      m.name,
      m.category || 'other',
      m.categoryLabel || m.category,
      m.item_status || 'lost',
      m.primaryColor || 'Sin especificar',
      m.brand || 'Sin especificar',
      m.description,
      m.date,
      m.location,
      m.locationContext || '',
      m.imageUrl,
      m.reportedBy,
      m.reportedEmail
    ]
  );
  await db.query('DELETE FROM moderation_items WHERE id = ?', [id]);
  return { approved: true };
}

export async function rejectItem(id) {
  const [result] = await db.query('DELETE FROM moderation_items WHERE id = ?', [id]);
  if (!result.affectedRows) throw new Error('Item no encontrado');
  return { rejected: true };
}
