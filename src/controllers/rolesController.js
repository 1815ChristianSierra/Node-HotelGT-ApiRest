const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

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
        const [rows] = await connection.query(
            "SELECT * FROM roles WHERE id = ?",
            [id]
        );
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
        const [result] = await connection.query(
            `INSERT INTO roles (name, description, created_at)
             VALUES (?, ?, NOW())`,
            [role.name, role.description]
        );
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
        const [result] = await connection.query(
            `UPDATE roles SET name = ?, description = ? WHERE id = ?`,
            [role.name, role.description, role.id]
        );
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
        const [result] = await connection.query(
            "DELETE FROM roles WHERE id = ?",
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { getRoles, getRoleById, insertRole, updateRole, deleteRole };