const express = require('express');
const router = express.Router();
const pagosmetodosController = require('../controllers/pagosmetodosController');
const { success, error } = require('../utils/response');

// GET /paymentMethods
router.get('/', async (req, res) => {
    try {
        const datos = await pagosmetodosController.getPaymentMethods();
        if (!datos || datos.length === 0) return error(res, 'No se encontraron métodos de pago', 404);
        return success(res, 'Métodos de pago obtenidos correctamente', datos);
    } catch (err) {
        console.error('Error GET /paymentMethods:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// GET /paymentMethods/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await pagosmetodosController.getPaymentMethodById(id);
        if (!datos || datos.length === 0) return error(res, 'Método de pago no encontrado', 404);
        return success(res, 'Método de pago obtenido correctamente', datos[0]);
    } catch (err) {
        console.error('Error GET /paymentMethods/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// POST /paymentMethods
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return error(res, 'El campo name es obligatorio', 400);
        const result = await pagosmetodosController.insertPaymentMethod(req.body);
        return success(res, 'Método de pago creado correctamente', { id: result.insertId }, 201);
    } catch (err) {
        console.error('Error POST /paymentMethods:', err);
        if (err.code === 'ER_DUP_ENTRY') return error(res, 'Ya existe un método de pago con ese nombre', 409);
        return error(res, 'Error interno del servidor', 500);
    }
});

// PUT /paymentMethods/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return error(res, 'El campo name es obligatorio', 400);
        const result = await pagosmetodosController.updatePaymentMethod({ ...req.body, id });
        if (result.affectedRows === 0) return error(res, 'Método de pago no encontrado', 404);
        return success(res, 'Método de pago actualizado correctamente');
    } catch (err) {
        console.error('Error PUT /paymentMethods/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

// DELETE /paymentMethods/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pagosmetodosController.deletePaymentMethod(id);
        if (result.affectedRows === 0) return error(res, 'Método de pago no encontrado', 404);
        return success(res, 'Método de pago eliminado correctamente');
    } catch (err) {
        console.error('Error DELETE /paymentMethods/:id:', err);
        return error(res, 'Error interno del servidor', 500);
    }
});

module.exports = router;
