const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { success, error } = require('../utils/response');

// GET /users → obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const datos = await usuariosController.getUsers();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron usuarios', 404);
        return success(res, 'Usuarios obtenidos correctamente', datos);
    } catch (err) {
        console.error('Error GET /users:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /users/:id → obtener usuario por id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await usuariosController.getUserById(id);
        if (!datos || datos.length === 0) return error(res, 'Usuario no encontrado', 404);
        return success(res, 'Usuario obtenido correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /users/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /users → crear usuario
router.post('/', async (req, res) => {
    try {
        const { name, email, password, rol_id } = req.body;
        if (!name || !email || !password || !rol_id) {
            return error(res, 'Los campos name, email, password y rol_id son obligatorios', 400);
        }
        const result = await usuariosController.insertUser(req.body);
        return success(res, 'Usuario creado correctamente', { id: result.insertId }, 201);
    } catch (err) {
        console.error('Error POST /users:', err);
        if (err.code === 'ER_DUP_ENTRY') return error(res, 'El email ya está registrado', 409);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /users/:id → actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, rol_id } = req.body;
        if (!name || !email || !rol_id) {
            return error(res, 'Los campos name, email y rol_id son obligatorios', 400);
        }
        const result = await usuariosController.updateUser({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Usuario no encontrado', 404);
        return success(res, 'Usuario actualizado correctamente');
    } catch (err) {
        console.error('Error PUT /users/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /users/:id → eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await usuariosController.deleteUser(id);
        if (result.affectedRows === 0) return error(res, 'Usuario no encontrado', 404);
        return success(res, 'Usuario eliminado correctamente');
    } catch (err) {
        console.error('Error DELETE /users/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;