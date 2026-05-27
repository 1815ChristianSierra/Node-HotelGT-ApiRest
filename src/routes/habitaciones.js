const express = require('express');
const router = express.Router();
const habitacionesController = require('../controllers/habitacionesController');
const { success, error } = require('../utils/response');

// GET /rooms → obtener todas las habitaciones
router.get('/', async (req, res) => {
    try {
        const datos = await habitacionesController.getRooms();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron habitaciones', 404);
        return success(res, 'Habitaciones obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /rooms:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

router.get('/disponibles', async (req, res) => {
    try {
        const { check_in, check_out, guests } = req.query;
        if (!check_in || !check_out || !guests) {
            return error(res, 'Los parámetros check_in, check_out y guests son obligatorios', 400);
        }
        const datos = await habitacionesController.getAvailableRooms(check_in, check_out, guests);
        if (!datos || datos.length === 0) return error(res, 'No hay habitaciones disponibles para esas fechas', 404);
        return success(res, 'Habitaciones disponibles obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /rooms/disponibles:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /rooms/:id → obtener habitación por id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await habitacionesController.getRoomById(id);
        if (!datos || datos.length === 0) return error(res, 'Habitación no encontrada', 404);
        return success(res, 'Habitación obtenida correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /rooms/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /rooms → crear habitación
router.post('/', async (req, res) => {
    try {
        const { room_number, name, type, capacity, base_price } = req.body;
        if (!room_number || !name || !type || !capacity || !base_price) {
            return error(res, 'Los campos room_number, name, type, capacity y base_price son obligatorios', 400);
        }
        const result = await habitacionesController.insertRoom(req.body);
        return success(res, 'Habitación creada correctamente', { id: result.insertId }, 201);
    } catch (err) {
        console.error('Error POST /rooms:', err);
        if (err.code === 'ER_DUP_ENTRY') return error(res, 'El número de habitación ya existe', 409);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /rooms/:id → actualizar habitación
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { room_number, name, type, capacity, base_price } = req.body;
        if (!room_number || !name || !type || !capacity || !base_price) {
            return error(res, 'Los campos room_number, name, type, capacity y base_price son obligatorios', 400);
        }
        const result = await habitacionesController.updateRoom({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Habitación no encontrada', 404);
        return success(res, 'Habitación actualizada correctamente');
    } catch (err) {
        console.error('Error PUT /rooms/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /rooms/:id → eliminar habitación
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await habitacionesController.deleteRoom(id);
        if (result.affectedRows === 0) return error(res, 'Habitación no encontrada', 404);
        return success(res, 'Habitación eliminada correctamente');
    } catch (err) {
        console.error('Error DELETE /rooms/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;
