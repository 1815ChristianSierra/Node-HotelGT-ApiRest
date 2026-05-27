const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');
 
// GET: obtener todas las asignaciones habitación-temporada
async function getRoomSeasons() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT rs.room_id, rs.season_id,
                    r.room_number, r.name AS room_name, r.type AS room_type,
                    s.name AS season_name, s.start_date, s.end_date, s.type AS season_type, s.price_adjustment
             FROM room_seasons rs
             INNER JOIN rooms r ON rs.room_id = r.id
             INNER JOIN seasons s ON rs.season_id = s.id`
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
 
// GET: obtener temporadas asignadas a una habitación específica
async function getSeasonsByRoom(room_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT rs.season_id,
                    s.name AS season_name, s.start_date, s.end_date, s.type AS season_type, s.price_adjustment
             FROM room_seasons rs
             INNER JOIN seasons s ON rs.season_id = s.id
             WHERE rs.room_id = ?`,
            [room_id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
 
// GET: obtener habitaciones asignadas a una temporada específica
async function getRoomsBySeason(season_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT rs.room_id,
                    r.room_number, r.name AS room_name, r.type AS room_type,
                    r.capacity, r.base_price, r.status
             FROM room_seasons rs
             INNER JOIN rooms r ON rs.room_id = r.id
             WHERE rs.season_id = ?`,
            [season_id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
 
// POST: asignar una temporada a una habitación
async function insertRoomSeason(room_id, season_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `INSERT INTO room_seasons (room_id, season_id) VALUES (?, ?)`,
            [room_id, season_id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
 
// DELETE: eliminar la asignación de una temporada a una habitación
async function deleteRoomSeason(room_id, season_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `DELETE FROM room_seasons WHERE room_id = ? AND season_id = ?`,
            [room_id, season_id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
 
module.exports = { getRoomSeasons, getSeasonsByRoom, getRoomsBySeason, insertRoomSeason, deleteRoomSeason };