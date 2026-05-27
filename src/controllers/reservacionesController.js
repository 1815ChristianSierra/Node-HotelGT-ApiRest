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
    const connection = await mysql.createConnection(db);
    try {
        // Generar código único de reservación
        const code = 'RES-' + Date.now().toString(36).toUpperCase();
        const reservationCode = reservation.reservation_code ?? code;
 
        // Iniciar transacción
        await connection.beginTransaction();
 
        // Validar que la habitación esté disponible
        const [room] = await connection.query(
            `SELECT id, status FROM rooms WHERE id = ? FOR UPDATE`,
            [reservation.room_id]
        );
 
        if (room.length === 0) {
            throw new Error('La habitación especificada no existe.');
        }
 
        if (room[0].status !== 'disponible') {
            throw new Error(
                `La habitación no está disponible. Estado actual: ${room[0].status}.`
            );
        }
 
        // Validar solapamiento de fechas con reservaciones activas
        const [existingReservations] = await connection.query(
            `SELECT id
             FROM reservations
             WHERE room_id = ?
               AND status NOT IN ('cancelada', 'completada', 'no_show')
               AND (
                       (? BETWEEN check_in_date AND check_out_date)
                    OR (? BETWEEN check_in_date AND check_out_date)
                    OR (check_in_date BETWEEN ? AND ?)
                   )`,
            [
                reservation.room_id,
                reservation.check_in_date,
                reservation.check_out_date,
                reservation.check_in_date,
                reservation.check_out_date
            ]
        );
 
        if (existingReservations.length > 0) {
            throw new Error(
                'La habitación ya está reservada en el rango de fechas seleccionado.'
            );
        }
 
        // Insertar reservación
        const [result] = await connection.query(
            `INSERT INTO reservations 
             (
                guest_id,
                room_id,
                created_by,
                reservation_code,
                check_in_date,
                check_out_date,
                guests_count,
                total_amount,
                status,
                notes,
                created_at,
                updated_at
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                reservation.guest_id,
                reservation.room_id,
                reservation.created_by,
                reservationCode,
                reservation.check_in_date,
                reservation.check_out_date,
                reservation.guests_count ?? 1,
                reservation.total_amount,
                reservation.status ?? 'pendiente',   // ✅ ENUM en español
                reservation.notes ?? null
            ]
        );
 
        // Actualizar estado de la habitación a ocupada
        await connection.query(
            `UPDATE rooms
             SET status = 'ocupada',                 -- ✅ ENUM en español
                 updated_at = NOW()
             WHERE id = ?`,
            [reservation.room_id]
        );
 
        // Insertar auditoría con columnas correctas del schema
        await connection.query(
            `INSERT INTO audit_logs
             (
                user_id,
                action,
                entity_type,
                entity_id,
                new_values,
                created_at
             )
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                reservation.created_by,
                'CREATE_RESERVATION',
                'reservation',                        // ✅ entity_type
                result.insertId,                      // ✅ entity_id
                JSON.stringify({                      // ✅ new_values (no 'details')
                    guest_id:         reservation.guest_id,
                    room_id:          reservation.room_id,
                    reservation_code: reservationCode,
                    check_in_date:    reservation.check_in_date,
                    check_out_date:   reservation.check_out_date,
                    total_amount:     reservation.total_amount,
                    status:           reservation.status ?? 'pendiente'
                })
            ]
        );
 
        // Insertar notificación al usuario que creó la reservación
        await connection.query(
            `INSERT INTO notifications (user_id, title, message)
             VALUES (?, ?, ?)`,
            [
                1, // Aquí podrías usar el ID del usuario que creó la reservación
                'Nueva reservación',
                `Se creó la reservación ${reservationCode}`
            ]
        );
 
        // Confirmar transacción
        await connection.commit();
        await connection.end();
 
        return {
            ...result,
            reservation_code: reservationCode
        };
 
    } catch (error) {
        // Revertir transacción ante cualquier fallo
        await connection.rollback();   // ✅ rollback en el catch
        await connection.end();
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
            [
                reservation.guest_id,
                reservation.room_id,
                reservation.check_in_date,
                reservation.check_out_date,
                reservation.guests_count,
                reservation.total_amount,
                reservation.status,
                reservation.notes,
                reservation.id
            ]
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
    const connection = await mysql.createConnection(db);
    try {
        await connection.beginTransaction();
 
        const [result] = await connection.query(
            `UPDATE reservations
             SET status = 'cancelada',            
                 cancelled_at = NOW(),
                 updated_at = NOW()
             WHERE id = ?
               AND status NOT IN ('completada', 'cancelada')`, 
            [id]
        );
 
        // Si se canceló, liberar la habitación
        if (result.affectedRows > 0) {
            const [reservation] = await connection.query(
                `SELECT room_id FROM reservations WHERE id = ?`,
                [id]
            );
            await connection.query(
                `UPDATE rooms SET status = 'disponible', updated_at = NOW() WHERE id = ?`,
                [reservation[0].room_id]
            );
        }
 
        await connection.commit();
        await connection.end();
        return result;
    } catch (error) {
        await connection.rollback();
        await connection.end();
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
             SET status = 'activa',               
                 actual_checkin = NOW(),
                 updated_at = NOW()
             WHERE id = ?
               AND status = 'confirmada'`,          
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
    const connection = await mysql.createConnection(db);
    try {
        await connection.beginTransaction();
 
        const [result] = await connection.query(
            `UPDATE reservations
             SET status = 'completada',            
                 actual_checkout = NOW(),
                 updated_at = NOW()
             WHERE id = ?
               AND status = 'activa'`,              
            [id]
        );
 
        // Si se hizo check-out, liberar la habitación
        if (result.affectedRows > 0) {
            const [reservation] = await connection.query(
                `SELECT room_id FROM reservations WHERE id = ?`,
                [id]
            );
            await connection.query(
                `UPDATE rooms SET status = 'disponible', updated_at = NOW() WHERE id = ?`,
                [reservation[0].room_id]
            );
        }
 
        await connection.commit();
        await connection.end();
        return result;
    } catch (error) {
        await connection.rollback();
        await connection.end();
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