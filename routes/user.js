const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Definir rutas
router.get("/prueba-user", UserController.pruebaUser);

// Exportar el Router
module.exports = router;