const mysql = require('mysql2/promise');
const db = require('../config/dbconfig');

// GET: obtener todos los métodos de pago
async function getPaymentMethods() {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query("SELECT * FROM payment_methods");
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// GET: obtener método de pago por Id
async function getPaymentMethodById(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [rows] = await connection.query(
            "SELECT * FROM payment_methods WHERE id = ?",
            [id]
        );
        await connection.end();
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// POST: agregar método de pago
async function insertPaymentMethod(method) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `INSERT INTO payment_methods (name, description, discount_percentage, is_active, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [method.name, method.description ?? null, method.discount_percentage ?? 0.00, method.is_active ?? 1]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// PUT: actualizar método de pago
async function updatePaymentMethod(method) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            `UPDATE payment_methods
             SET name = ?, description = ?, discount_percentage = ?, is_active = ?
             WHERE id = ?`,
            [method.name, method.description, method.discount_percentage, method.is_active, method.id]
        );
        await connection.end();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// DELETE: eliminar método de pago por Id
async function deletePaymentMethod(id) {
    try {
        const connection = await mysql.createConnection(db);
        const [result] = await connection.query(
            "DELETE FROM payment_methods WHERE id = ?",
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
    getPaymentMethods, getPaymentMethodById, insertPaymentMethod, updatePaymentMethod, deletePaymentMethod
};
