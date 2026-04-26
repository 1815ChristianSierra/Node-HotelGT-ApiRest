const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todos los usuarios
async function getUsers() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT u.id, u.name, u.email, u.rol_id, r.name AS rol_nombre,
                    u.phone, u.is_active, u.email_verified_at, u.created_at, u.updated_at
             FROM users u
             INNER JOIN roles r ON u.rol_id = r.id`
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener usuario por Id
async function getUserById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT u.id, u.name, u.email, u.rol_id, r.name AS rol_nombre,
                    u.phone, u.is_active, u.email_verified_at, u.created_at, u.updated_at
             FROM users u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.id = ?`,
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: agregar usuario
async function insertUser(usuario) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `INSERT INTO users (name, email, password_hash, rol_id, phone, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [usuario.name, usuario.email, usuario.password_hash, usuario.rol_id, usuario.phone, usuario.is_active ?? 1]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PUT: actualizar usuario
async function updateUser(usuario) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE users
             SET name = ?, email = ?, rol_id = ?, phone = ?, is_active = ?, updated_at = NOW()
             WHERE id = ?`,
            [usuario.name, usuario.email, usuario.rol_id, usuario.phone, usuario.is_active, usuario.id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar usuario por Id
async function deleteUser(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { getUsers, getUserById, insertUser, updateUser, deleteUser };