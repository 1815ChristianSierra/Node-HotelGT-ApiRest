const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todos los pagos
async function getPayments() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT p.*, 
                    r.reservation_code, pm.name AS metodo_pago,
                    u.name AS recibido_por_nombre
             FROM payments p
             INNER JOIN reservations r ON p.reservation_id = r.id
             INNER JOIN payment_methods pm ON p.method_id = pm.id
             INNER JOIN users u ON p.received_by = u.id
             ORDER BY p.created_at DESC`
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener pago por Id
async function getPaymentById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT p.*, 
                    r.reservation_code, pm.name AS metodo_pago,
                    u.name AS recibido_por_nombre
             FROM payments p
             INNER JOIN reservations r ON p.reservation_id = r.id
             INNER JOIN payment_methods pm ON p.method_id = pm.id
             INNER JOIN users u ON p.received_by = u.id
             WHERE p.id = ?`,
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener pagos por reservación
async function getPaymentsByReservation(reservation_id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            `SELECT p.*, pm.name AS metodo_pago
             FROM payments p
             INNER JOIN payment_methods pm ON p.method_id = pm.id
             WHERE p.reservation_id = ?`,
            [reservation_id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: registrar pago
async function insertPayment(payment) {
    try {
        const connection = await mysql.createConnection(db);
        const ref = 'PAY-' + Date.now().toString(36).toUpperCase();
        const [result] = await connection.query(
            `INSERT INTO payments 
             (reservation_id, received_by, reference_number, amount, method_id, type, status, notes, paid_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [payment.reservation_id, payment.received_by,
             payment.reference_number ?? ref,
             payment.amount, payment.method_id,
             payment.type ?? 'full', payment.status ?? 'completed',
             payment.notes ?? null]
        );
        await connection.end();
        return { ...result, reference_number: payment.reference_number ?? ref };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PUT: actualizar pago
async function updatePayment(payment) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE payments
             SET amount = ?, method_id = ?, type = ?, status = ?, notes = ?
             WHERE id = ?`,
            [payment.amount, payment.method_id, payment.type, payment.status, payment.notes, payment.id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar pago por Id
async function deletePayment(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            "DELETE FROM payments WHERE id = ?",
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
    getPayments, getPaymentById, getPaymentsByReservation, insertPayment, updatePayment, deletePayment
};
