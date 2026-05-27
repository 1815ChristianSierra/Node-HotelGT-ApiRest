const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todas las temporadas
async function getSeasons() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query("SELECT * FROM seasons ORDER BY start_date ASC");
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener temporada por Id
async function getSeasonById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            "SELECT * FROM seasons WHERE id = ?",
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: agregar temporada
async function insertSeason(season) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `INSERT INTO seasons (name, start_date, end_date, price_adjustment, type, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [season.name, season.start_date, season.end_date, season.price_adjustment ?? 0.00, season.type]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PUT: actualizar temporada
async function updateSeason(season) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE seasons
             SET name = ?, start_date = ?, end_date = ?, price_adjustment = ?, type = ?, updated_at = NOW()
             WHERE id = ?`,
            [season.name, season.start_date, season.end_date, season.price_adjustment, season.type, season.id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar temporada por Id
async function deleteSeason(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            "DELETE FROM seasons WHERE id = ?",
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = { getSeasons, getSeasonById, insertSeason, updateSeason, deleteSeason };