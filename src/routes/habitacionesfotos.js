const express = require('express');
const router = express.Router();
const habitacionesfotosController = require('../controllers/habitacionesfotosController');
const { success, error } = require('../utils/response');

// GET /roomPhotos/room/:room_id → fotos de una habitación
router.get('/room/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;
        const datos = await habitacionesfotosController.getPhotosByRoom(room_id);
        if (!datos || datos.length === 0) return error(res, 'No se encontraron fotos para esta habitación', 404);
        return success(res, 'Fotos obtenidas correctamente', datos);
    } catch (err) {
        console.error('Error GET /roomPhotos/room/:room_id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /roomPhotos/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await habitacionesfotosController.getPhotoById(id);
        if (!datos || datos.length === 0) return error(res, 'Foto no encontrada', 404);
        return success(res, 'Foto obtenida correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /roomPhotos/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /roomPhotos
router.post('/', async (req, res) => {
    try {
        const { room_id, url } = req.body;
        if (!room_id || !url) return error(res, 'Los campos room_id y url son obligatorios', 400);
        const result = await habitacionesfotosController.insertPhoto(req.body);
        return success(res, 'Foto agregada correctamente', { id: result.insertId }, 201);
    } catch (err) {
        console.error('Error POST /roomPhotos:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /roomPhotos/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body;
        if (!url) return error(res, 'El campo url es obligatorio', 400);
        const result = await habitacionesfotosController.updatePhoto({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Foto no encontrada', 404);
        return success(res, 'Foto actualizada correctamente');
    } catch (err) {
        console.error('Error PUT /roomPhotos/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /roomPhotos/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await habitacionesfotosController.deletePhoto(id);
        if (result.affectedRows === 0) return error(res, 'Foto no encontrada', 404);
        return success(res, 'Foto eliminada correctamente');
    } catch (err) {
        console.error('Error DELETE /roomPhotos/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;
