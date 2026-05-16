const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todas las habitaciones
async function getRooms() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query("SELECT * FROM rooms");
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener habitación por Id
async function getRoomById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            "SELECT * FROM rooms WHERE id = ?",
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener habitaciones disponibles por fechas y capacidad
async function getAvailableRooms(check_in_date, check_out_date, guests_count) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT * FROM rooms
             WHERE status = 'available'
               AND capacity >= ?
               AND id NOT IN (
                   SELECT room_id FROM reservations
                   WHERE status NOT IN ('cancelled','no_show')
                     AND check_in_date < ?
                     AND check_out_date > ?
               )`,
            [guests_count, check_out_date, check_in_date]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: agregar habitación
async function insertRoom(room) {
    try {
        const connection = await mysql.createConnection(db);
        const amenities = room.amenities ? JSON.stringify(room.amenities) : null;
        const [result] = await connection.query(
            `INSERT INTO rooms (room_number, name, type, capacity, description, base_price, status, amenities, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [room.room_number, room.name, room.type, room.capacity, room.description,
             room.base_price, room.status ?? 'available', amenities]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PUT: actualizar habitación
async function updateRoom(room) {
    try {
        const connection = await mysql.createConnection(db);
        const amenities = room.amenities ? JSON.stringify(room.amenities) : null;
        const [result] = await connection.query(
            `UPDATE rooms
             SET room_number = ?, name = ?, type = ?, capacity = ?, description = ?,
                 base_price = ?, status = ?, amenities = ?, updated_at = NOW()
             WHERE id = ?`,
            [room.room_number, room.name, room.type, room.capacity, room.description,
             room.base_price, room.status, amenities, room.id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar habitación por Id
async function deleteRoom(id) {
    try {
        const connection = await mysql.createConnection(db);

        const [result] = await connection.query(
            "UPDATE rooms SET status = 'inactiva' WHERE id = ?",
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { getRooms, getRoomById, getAvailableRooms, insertRoom, updateRoom, deleteRoom };