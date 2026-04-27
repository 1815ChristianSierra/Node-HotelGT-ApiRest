const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todas las fotos de una habitación
async function getPhotosByRoom(room_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            "SELECT * FROM room_photos WHERE room_id = ? ORDER BY sort_order ASC",
            [room_id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener foto por Id
async function getPhotoById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            "SELECT * FROM room_photos WHERE id = ?",
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: agregar foto a habitación
async function insertPhoto(photo) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `INSERT INTO room_photos (room_id, url, caption, is_primary, sort_order, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [photo.room_id, photo.url, photo.caption ?? null, photo.is_primary ?? 0, photo.sort_order ?? 0]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PUT: actualizar foto
async function updatePhoto(photo) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE room_photos
             SET url = ?, caption = ?, is_primary = ?, sort_order = ?
             WHERE id = ?`,
            [photo.url, photo.caption, photo.is_primary, photo.sort_order, photo.id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar foto por Id
async function deletePhoto(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            "DELETE FROM room_photos WHERE id = ?",
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { getPhotosByRoom, getPhotoById, insertPhoto, updatePhoto, deletePhoto };
