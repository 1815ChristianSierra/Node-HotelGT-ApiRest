const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todas las reservaciones
async function getReservations() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT r.*, 
                    g.name AS guest_nombre, g.email AS guest_email,
                    ro.room_number, ro.name AS room_nombre, ro.type AS room_tipo
             FROM reservations r
             INNER JOIN users g ON r.guest_id = g.id
             INNER JOIN rooms ro ON r.room_id = ro.id
             ORDER BY r.created_at DESC`
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener reservación por Id
async function getReservationById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT r.*, 
                    g.name AS guest_nombre, g.email AS guest_email,
                    ro.room_number, ro.name AS room_nombre, ro.type AS room_tipo
             FROM reservations r
             INNER JOIN users g ON r.guest_id = g.id
             INNER JOIN rooms ro ON r.room_id = ro.id
             WHERE r.id = ?`,
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener reservaciones por huésped
async function getReservationsByGuest(guest_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT r.*, ro.room_number, ro.name AS room_nombre
             FROM reservations r
             INNER JOIN rooms ro ON r.room_id = ro.id
             WHERE r.guest_id = ?
             ORDER BY r.check_in_date DESC`,
            [guest_id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: agregar reservación
async function insertReservation(reservation) {
    try {
        const connection = await mysql.createConnection(db);

        // Generar código único de reservación
        const code = 'RES-' + Date.now().toString(36).toUpperCase();

        const [result] = await connection.query(
            `INSERT INTO reservations 
             (guest_id, room_id, created_by, reservation_code, check_in_date, check_out_date,
              guests_count, total_amount, status, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [reservation.guest_id, reservation.room_id, reservation.created_by,
             reservation.reservation_code ?? code,
             reservation.check_in_date, reservation.check_out_date,
             reservation.guests_count ?? 1, reservation.total_amount,
             reservation.status ?? 'pending', reservation.notes ?? null]
        );
        await connection.end();
        return { ...result, reservation_code: reservation.reservation_code ?? code };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PUT: actualizar reservación
async function updateReservation(reservation) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE reservations
             SET guest_id = ?, room_id = ?, check_in_date = ?, check_out_date = ?,
                 guests_count = ?, total_amount = ?, status = ?, notes = ?, updated_at = NOW()
             WHERE id = ?`,
            [reservation.guest_id, reservation.room_id, reservation.check_in_date,
             reservation.check_out_date, reservation.guests_count, reservation.total_amount,
             reservation.status, reservation.notes, reservation.id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PATCH: cancelar reservación
async function cancelReservation(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE reservations
             SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
             WHERE id = ? AND status NOT IN ('completed','cancelled')`,
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PATCH: registrar check-in
async function checkIn(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE reservations
             SET status = 'active', actual_checkin = NOW(), updated_at = NOW()
             WHERE id = ? AND status = 'confirmed'`,
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PATCH: registrar check-out
async function checkOut(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE reservations
             SET status = 'completed', actual_checkout = NOW(), updated_at = NOW()
             WHERE id = ? AND status = 'active'`,
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar reservación por Id
async function deleteReservation(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            "DELETE FROM reservations WHERE id = ?",
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    getReservations,
    getReservationById,
    getReservationsByGuest,
    insertReservation,
    updateReservation,
    cancelReservation,
    checkIn,
    checkOut,
    deleteReservation
};