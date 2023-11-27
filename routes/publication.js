const express = require('express');
const router = express.Router();
const PublicationController = require('../controllers/publication');

// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);

// Exportar el Router
module.exports = router;