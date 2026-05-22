const mysql = require("mysql2/promise");
const db = require("../config/dbconfig");

// GET: obtener todos los roles
async function getRoles() {
  try {
    const connection = await mysql.createConnection(db);
    const [rows] = await connection.query("SELECT * FROM roles");
    await connection.end();
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// GET: obtener rol por Id
async function getRoleById(id) {
  try {
    const connection = await mysql.createConnection(db);
    const [rows] = await connection.query("SELECT * FROM roles WHERE id = ?", [
      id,
    ]);
    await connection.end();
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// POST: agregar rol
async function insertRole(role) {
  try {
    const connection = await mysql.createConnection(db);

    await connection.beginTransaction();

    // Insertar rol
    const [result] = await connection.query(
      `INSERT INTO roles (
                name,
                description,
                created_at
            )
            VALUES (?, ?, NOW())`,
      [role.name, role.description],
    );

    // Auditoría
    await connection.query(
      `INSERT INTO audit_logs (
                user_id,
                action,
                entity_type,
                entity_id,
                old_values,
                new_values,
                ip_address,
                user_agent,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        null,
        "CREATE",
        "roles",
        result.insertId,
        null,
        JSON.stringify({
          name: role.name,
          description: role.description,
        }),
        null,
        null,
      ],
    );

    await connection.commit();

    await connection.end();

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// PUT: actualizar rol
async function updateRole(role) {
  try {
    const connection = await mysql.createConnection(db);

    await connection.beginTransaction();

    // Obtener datos anteriores
    const [oldRows] = await connection.query(
      `SELECT name, description
             FROM roles
             WHERE id = ?`,
      [role.id],
    );

    if (oldRows.length === 0) {
      throw new Error("El rol no existe");
    }

    const oldRole = oldRows[0];

    // Actualizar rol
    const [result] = await connection.query(
      `UPDATE roles
             SET
                name = ?,
                description = ?
             WHERE id = ?`,
      [role.name, role.description, role.id],
    );

    // Auditoría
    await connection.query(
      `INSERT INTO audit_logs (
                user_id,
                action,
                entity_type,
                entity_id,
                old_values,
                new_values,
                ip_address,
                user_agent,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        null,
        "UPDATE",
        "roles",
        role.id,
        JSON.stringify({
          name: oldRole.name,
          description: oldRole.description,
        }),
        JSON.stringify({
          name: role.name,
          description: role.description,
        }),
        null,
        null,
      ],
    );

    await connection.commit();

    await connection.end();

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// DELETE: eliminar rol por Id
async function deleteRole(id) {
  try {
    const connection = await mysql.createConnection(db);
    const [result] = await connection.query("DELETE FROM roles WHERE id = ?", [
      id,
    ]);
    await connection.end();
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = { getRoles, getRoleById, insertRole, updateRole, deleteRole };
