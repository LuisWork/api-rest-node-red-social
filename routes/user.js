const express = require('express');
const router = express.Router();
const UserController = require("../controllers/user");
const check = require('../middlewares/auth');

// Definir rutas
router.get("/prueba-user", check.auth, UserController.pruebaUser);
router.post("/register", UserController.guardarUsuario);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);

// Exportar el Router
module.exports = router;