const express = require('express');
const router = express.Router();
const reservacionesController = require('../controllers/reservacionesController');
const { success, error } = require('../utils/response');

// GET /reservations
router.get('/', async (req, res) => {
    try {
        const datos = await reservacionesController.getReservations();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron reservaciones', 404);
        return success(res, 'Reservaciones obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /reservations:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /reservations/guest/:guest_id → reservaciones por huésped
router.get('/guest/:guest_id', async (req, res) => {
    try {
        const { guest_id } = req.params;
        const datos = await reservacionesController.getReservationsByGuest(guest_id);
        if (!datos || datos.length === 0) return error(res, 'No se encontraron reservaciones para este huésped', 404);
        return success(res, 'Reservaciones del huésped obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /reservations/guest/:guest_id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /reservations/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await reservacionesController.getReservationById(id);
        if (!datos || datos.length === 0) return error(res, 'Reservación no encontrada', 404);
        return success(res, 'Reservación obtenida correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /reservations/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /reservations
router.post('/', async (req, res) => {
    try {
        const { guest_id, room_id, created_by, check_in_date, check_out_date, total_amount } = req.body;
        if (!guest_id || !room_id || !created_by || !check_in_date || !check_out_date || !total_amount) {
            return error(res, 'Los campos guest_id, room_id, created_by, check_in_date, check_out_date y total_amount son obligatorios', 400);
        }
        if (new Date(check_out_date) <= new Date(check_in_date)) {
            return error(res, 'La fecha de salida debe ser posterior a la fecha de entrada', 400);
        }
        const result = await reservacionesController.insertReservation(req.body);
        return success(res, 'Reservación creada correctamente', { id: result.insertId, reservation_code: result.reservation_code }, 201);
    } catch (err) {
        console.error('Error POST /reservations:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /reservations/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { guest_id, room_id, check_in_date, check_out_date, total_amount, status } = req.body;
        if (!guest_id || !room_id || !check_in_date || !check_out_date || !total_amount || !status) {
            return error(res, 'Faltan datos obligatorios', 400);
        }
        const result = await reservacionesController.updateReservation({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Reservación no encontrada', 404);
        return success(res, 'Reservación actualizada correctamente');
    } catch (err) {
        console.error('Error PUT /reservations/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PATCH /reservations/:id/cancel → cancelar reservación
router.patch('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await reservacionesController.cancelReservation(id);
        if (result.affectedRows === 0) return error(res, 'No se pudo cancelar: reservación no encontrada o ya fue completada/cancelada', 400);
        return success(res, 'Reservación cancelada correctamente');
    } catch (err) {
        console.error('Error PATCH /reservations/:id/cancel:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PATCH /reservations/:id/checkin → registrar check-in
router.patch('/:id/checkin', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await reservacionesController.checkIn(id);
        if (result.affectedRows === 0) return error(res, 'No se pudo hacer check-in: la reservación debe estar en estado "confirmed"', 400);
        return success(res, 'Check-in registrado correctamente');
    } catch (err) {
        console.error('Error PATCH /reservations/:id/checkin:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PATCH /reservations/:id/checkout → registrar check-out
router.patch('/:id/checkout', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await reservacionesController.checkOut(id);
        if (result.affectedRows === 0) return error(res, 'No se pudo hacer check-out: la reservación debe estar en estado "active"', 400);
        return success(res, 'Check-out registrado correctamente');
    } catch (err) {
        console.error('Error PATCH /reservations/:id/checkout:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /reservations/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await reservacionesController.deleteReservation(id);
        if (result.affectedRows === 0) return error(res, 'Reservación no encontrada', 404);
        return success(res, 'Reservación eliminada correctamente');
    } catch (err) {
        console.error('Error DELETE /reservations/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;
