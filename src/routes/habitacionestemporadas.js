const express = require('express');
const router = express.Router();
const habitacionestemporadasController = require('../controllers/habitacionestemporadasController');
const { success, error } = require('../utils/response');

// GET /roomSeasons → obtener todas las asignaciones habitación-temporada
router.get('/', async (req, res) => {
    try {
        const datos = await habitacionestemporadasController.getRoomSeasons();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron asignaciones de temporadas', 404);
        return success(res, 'Asignaciones habitación-temporada obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /roomSeasons:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});
 
// GET /roomSeasons/habitacion/:room_id → obtener temporadas de una habitación
router.get('/habitacion/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;
        const datos = await habitacionestemporadasController.getSeasonsByRoom(room_id);
        if (!datos || datos.length === 0) return error(res, 'No se encontraron temporadas para esta habitación', 404);
        return success(res, 'Temporadas de la habitación obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /roomSeasons/habitacion/:room_id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});
 
// GET /roomSeasons/temporada/:season_id → obtener habitaciones de una temporada
router.get('/temporada/:season_id', async (req, res) => {
    try {
        const { season_id } = req.params;
        const datos = await habitacionestemporadasController.getRoomsBySeason(season_id);
        if (!datos || datos.length === 0) return error(res, 'No se encontraron habitaciones para esta temporada', 404);
        return success(res, 'Habitaciones de la temporada obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /roomSeasons/temporada/:season_id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});
 
// POST /roomSeasons → asignar una temporada a una habitación
router.post('/', async (req, res) => {
    try {
        const { room_id, season_id } = req.body;
        if (!room_id || !season_id) {
            return error(res, 'Los campos room_id y season_id son obligatorios', 400);
        }
        await habitacionestemporadasController.insertRoomSeason(room_id, season_id);
        return success(res, 'Temporada asignada a la habitación correctamente', { room_id, season_id }, 201);
    } catch (err) {
        console.error('Error POST /roomSeasons:', err);
        if (err.code === 'ER_DUP_ENTRY') return error(res, 'Esta temporada ya está asignada a la habitación', 409);
        if (err.code === 'ER_NO_REFERENCED_ROW_2') return error(res, 'La habitación o temporada especificada no existe', 404);
        return error(res, 'Error interno del servidor', 500);
    }
});
 
// DELETE /roomSeasons → eliminar la asignación de una temporada a una habitación
router.delete('/', async (req, res) => {
    try {
        const { room_id, season_id } = req.body;
        if (!room_id || !season_id) {
            return error(res, 'Los campos room_id y season_id son obligatorios', 400);
        }
        const result = await habitacionestemporadasController.deleteRoomSeason(room_id, season_id);
        if (result.affectedRows === 0) return error(res, 'Asignación no encontrada', 404);
        return success(res, 'Asignación eliminada correctamente');
    } catch (err) {
        console.error('Error DELETE /roomSeasons:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});
 
module.exports = router;