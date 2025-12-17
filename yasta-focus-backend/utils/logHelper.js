import db from '../db.js';

/**
 * Insert a log entry into the log table.
 * @param {Object} params
 * @param {string} params.user_id - UUID of the user
 * @param {string} params.action_type - Type of action (e.g., LOGIN, CREATE_TASK)
 * @param {string} params.action_content - Description/content of the action
 * @param {string} params.actor_type - Type of actor (e.g., user, admin)
 * @returns {Promise<Object>} The inserted log row
 */
async function insertLog({ user_id, action_type, action_content, actor_type }) {
  const query = `
    INSERT INTO log (user_id, action_type, action_content, actor_type)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [user_id, action_type, action_content, actor_type];
  const { rows } = await db.query(query, values);
  return rows[0];
}

export { insertLog };