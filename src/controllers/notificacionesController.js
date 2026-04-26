const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todas las notificaciones
async function getNotifications() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT n.*, r.reservation_code, u.name AS usuario_nombre
             FROM notifications n
             INNER JOIN reservations r ON n.reservation_id = r.id
             INNER JOIN users u ON n.user_id = u.id
             ORDER BY n.created_at DESC`
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener notificación por Id
async function getNotificationById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT n.*, r.reservation_code, u.name AS usuario_nombre
             FROM notifications n
             INNER JOIN reservations r ON n.reservation_id = r.id
             INNER JOIN users u ON n.user_id = u.id
             WHERE n.id = ?`,
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener notificaciones por reservación
async function getNotificationsByReservation(reservation_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            "SELECT * FROM notifications WHERE reservation_id = ? ORDER BY created_at DESC",
            [reservation_id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: crear notificación
async function insertNotification(notification) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `INSERT INTO notifications (reservation_id, user_id, type, channel, status, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [notification.reservation_id, notification.user_id,
             notification.type, notification.channel ?? 'email', notification.status ?? 'pending']
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PATCH: marcar notificación como enviada
async function markAsSent(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE notifications SET status = 'sent', sent_at = NOW() WHERE id = ?`,
            [id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar notificación por Id
async function deleteNotification(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            "DELETE FROM notifications WHERE id = ?",
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
    getNotifications, getNotificationById, getNotificationsByReservation,
    insertNotification, markAsSent, deleteNotification
};
