const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { success, error } = require('../utils/response');

// GET /roles → obtener todos los roles
router.get('/', async (req, res) => {
    try {
        const datos = await rolesController.getRoles();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron roles', 404);
        return success(res, 'Roles obtenidos correctamente', datos);
    } catch (err) {
        console.error('Error GET /roles:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /roles/:id → obtener rol por id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await rolesController.getRoleById(id);
        if (!datos || datos.length === 0) return error(res, 'Rol no encontrado', 404);
        return success(res, 'Rol obtenido correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /roles/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /roles → agregar rol
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return error(res, 'El campo name es obligatorio', 400);
        const result = await rolesController.insertRole(req.body);
        return success(res, 'Rol creado correctamente', { id: result.insertId }, 201);
    } catch (err) {
        console.error('Error POST /roles:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /roles/:id → actualizar rol
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return error(res, 'El campo name es obligatorio', 400);
        const result = await rolesController.updateRole({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Rol no encontrado', 404);
        return success(res, 'Rol actualizado correctamente');
    } catch (err) {
        console.error('Error PUT /roles/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /roles/:id → eliminar rol
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await rolesController.deleteRole(id);
        if (result.affectedRows === 0) return error(res, 'Rol no encontrado', 404);
        return success(res, 'Rol eliminado correctamente');
    } catch (err) {
        console.error('Error DELETE /roles/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;
