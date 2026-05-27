const express = require('express');
const router = express.Router();
const temporadasController = require('../controllers/temporadasController');
const { success, error } = require('../utils/response');

// GET /seasons
router.get('/', async (req, res) => {
    try {
        const datos = await temporadasController.getSeasons();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron temporadas', 404);
        return success(res, 'Temporadas obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /seasons:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /seasons/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await temporadasController.getSeasonById(id);
        if (!datos || datos.length === 0) return error(res, 'Temporada no encontrada', 404);
        return success(res, 'Temporada obtenida correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /seasons/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /seasons
router.post('/', async (req, res) => {
    try {
        const { name, start_date, end_date, type } = req.body;
        if (!name || !start_date || !end_date || !type) {
            return error(res, 'Los campos name, start_date, end_date y type son obligatorios', 400);
        }
        if (new Date(end_date) < new Date(start_date)) {
            return error(res, 'La fecha de fin debe ser mayor o igual a la fecha de inicio', 400);
        }
        const result = await temporadasController.insertSeason(req.body);
        return success(res, 'Temporada creada correctamente', { id: result.insertId }, 201);
    } catch (err) {
        console.error('Error POST /seasons:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /seasons/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, start_date, end_date, type } = req.body;
        if (!name || !start_date || !end_date || !type) {
            return error(res, 'Los campos name, start_date, end_date y type son obligatorios', 400);
        }
        if (new Date(end_date) < new Date(start_date)) {
            return error(res, 'La fecha de fin debe ser mayor o igual a la fecha de inicio', 400);
        }
        const result = await temporadasController.updateSeason({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Temporada no encontrada', 404);
        return success(res, 'Temporada actualizada correctamente');
    } catch (err) {
        console.error('Error PUT /seasons/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /seasons/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await temporadasController.deleteSeason(id);
        if (result.affectedRows === 0) return error(res, 'Temporada no encontrada', 404);
        return success(res, 'Temporada eliminada correctamente');
    } catch (err) {
        console.error('Error DELETE /seasons/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;