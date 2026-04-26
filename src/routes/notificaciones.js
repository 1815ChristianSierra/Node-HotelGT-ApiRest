const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificacioneController');
const { success, error } = require('../utils/response');

// GET /notifications
router.get('/', async (req, res) => {
    try {
        const datos = await notificacionesController.getNotifications();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron notificaciones', 404);
        return success(res, 'Notificaciones obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /notifications:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /notifications/reservation/:reservation_id
router.get('/reservation/:reservation_id', async (req, res) => {
    try {
        const { reservation_id } = req.params;
        const datos = await notificacionesController.getNotificationsByReservation(reservation_id);
        if (!datos || datos.length === 0) return error(res, 'No se encontraron notificaciones para esta reservación', 404);
        return success(res, 'Notificaciones de la reservación obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /notifications/reservation/:reservation_id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /notifications/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await notificacionesController.getNotificationById(id);
        if (!datos || datos.length === 0) return error(res, 'Notificación no encontrada', 404);
        return success(res, 'Notificación obtenida correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /notifications/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /notifications
router.post('/', async (req, res) => {
    try {
        const { reservation_id, user_id, type } = req.body;
        if (!reservation_id || !user_id || !type) {
            return error(res, 'Los campos reservation_id, user_id y type son obligatorios', 400);
        }
        const result = await notificacionesController.insertNotification(req.body);
        return success(res, 'Notificación creada correctamente', { id: result.insertId }, 201);
    } catch (err) {
        console.error('Error POST /notifications:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PATCH /notifications/:id/sent → marcar como enviada
router.patch('/:id/sent', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await notificacionesController.markAsSent(id);
        if (result.affectedRows === 0) return error(res, 'Notificación no encontrada', 404);
        return success(res, 'Notificación marcada como enviada');
    } catch (err) {
        console.error('Error PATCH /notifications/:id/sent:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await notificacionesController.deleteNotification(id);
        if (result.affectedRows === 0) return error(res, 'Notificación no encontrada', 404);
        return success(res, 'Notificación eliminada correctamente');
    } catch (err) {
        console.error('Error DELETE /notifications/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;