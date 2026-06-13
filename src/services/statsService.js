import db from '../db.js';

export async function getStats() {
  const [[itemCounts]] = await db.query(`
    SELECT
      COUNT(*)                                      AS totalItems,
      SUM(status = 'lost')                          AS lostItems,
      SUM(status = 'found')                         AS foundItems,
      SUM(status = 'returned')                      AS returnedItems,
      ROUND(SUM(status IN ('found','returned')) / COUNT(*) * 100, 1) AS recoveryRate
    FROM items
  `);

  const [[{ totalUsers }]] = await db.query(
    `SELECT COUNT(*) AS totalUsers FROM users`
  );

  const [[{ pendingModeration }]] = await db.query(
    `SELECT COUNT(*) AS pendingModeration FROM moderation_items`
  );

  return {
    totalItems:        Number(itemCounts.totalItems)    || 0,
    lostItems:         Number(itemCounts.lostItems)     || 0,
    foundItems:        Number(itemCounts.foundItems)    || 0,
    returnedItems:     Number(itemCounts.returnedItems) || 0,
    recoveryRate:      Number(itemCounts.recoveryRate)  || 0,
    totalUsers:        Number(totalUsers)               || 0,
    pendingModeration: Number(pendingModeration)        || 0,
  };
}

export async function getByCategory() {
  const [rows] = await db.query(`
    SELECT category AS name, COUNT(*) AS value
    FROM items
    GROUP BY category
    ORDER BY value DESC
  `);
  return rows.map(r => ({ name: r.name, value: Number(r.value) }));
}

export async function getWeeklyTrend() {
  const [rows] = await db.query(`
    SELECT
      CONCAT('Sem ', CEIL(DATEDIFF(date, DATE_SUB(CURDATE(), INTERVAL 6 WEEK)) / 7)) AS week,
      COUNT(*)                        AS reportes,
      SUM(status IN ('found','returned')) AS recuperados
    FROM items
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 WEEK)
    GROUP BY week
    ORDER BY MIN(date)
  `);
  return rows.map(r => ({
    week:        r.week,
    reportes:    Number(r.reportes),
    recuperados: Number(r.recuperados),
  }));
}

export async function getMonthlyTrend() {
  const [rows] = await db.query(`
    SELECT
      DATE_FORMAT(date, '%b') AS month,
      COUNT(*)                AS volumen
    FROM items
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(date, '%Y-%m'), DATE_FORMAT(date, '%b')
    ORDER BY MIN(date)
  `);
  return rows.map(r => ({ month: r.month, volumen: Number(r.volumen) }));
}
