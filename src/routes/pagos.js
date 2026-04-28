const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const { success, error } = require('../utils/response');

// GET /payments
router.get('/', async (req, res) => {
    try {
        const datos = await pagosController.getPayments();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron pagos', 404);
        return success(res, 'Pagos obtenidos correctamente', datos);
    } catch (err) {
        console.error('Error GET /payments:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /payments/reservation/:reservation_id → pagos por reservación
router.get('/reservation/:reservation_id', async (req, res) => {
    try {
        const { reservation_id } = req.params;
        const datos = await pagosController.getPaymentsByReservation(reservation_id);
        if (!datos || datos.length === 0) return error(res, 'No se encontraron pagos para esta reservación', 404);
        return success(res, 'Pagos de la reservación obtenidos correctamente', datos);
    } catch (err) {
        console.error('Error GET /payments/reservation/:reservation_id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /payments/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await pagosController.getPaymentById(id);
        if (!datos || datos.length === 0) return error(res, 'Pago no encontrado', 404);
        return success(res, 'Pago obtenido correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /payments/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /payments
router.post('/', async (req, res) => {
    try {
        const { reservation_id, received_by, amount, method_id } = req.body;
        if (!reservation_id || !received_by || !amount || !method_id) {
            return error(res, 'Los campos reservation_id, received_by, amount y method_id son obligatorios', 400);
        }
        if (amount <= 0) return error(res, 'El monto debe ser mayor a 0', 400);
        const result = await paymentsController.insertPayment(req.body);
        return success(res, 'Pago registrado correctamente', { id: result.insertId, reference_number: result.reference_number }, 201);
    } catch (err) {
        console.error('Error POST /payments:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /payments/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, method_id, type, status } = req.body;
        if (!amount || !method_id || !type || !status) {
            return error(res, 'Los campos amount, method_id, type y status son obligatorios', 400);
        }
        const result = await pagosController.updatePayment({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Pago no encontrado', 404);
        return success(res, 'Pago actualizado correctamente');
    } catch (err) {
        console.error('Error PUT /payments/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /payments/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pagosController.deletePayment(id);
        if (result.affectedRows === 0) return error(res, 'Pago no encontrado', 404);
        return success(res, 'Pago eliminado correctamente');
    } catch (err) {
        console.error('Error DELETE /payments/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;
