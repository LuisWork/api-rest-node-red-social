const express = require('express');
const router = express.Router();
const UserController = require("../controllers/User");
const check = require('../middlewares/auth');

// Definir rutas
router.get("/prueba-user", check.auth, UserController.pruebaUser);
router.post("/register", UserController.guardarUsuario);
router.post("/login", UserController.login);

// Exportar el Router
module.exports = router;