const follow = require("../models/follow");
const user = require("../models/user");

// Acciones de prueba
const pruebaFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: controllers/follow.js",
  });
};

// Accion de seguir

// Accion de dejar de seguir

// Listado de usuarios que estoy siguiendo

// Accion de listar usuarios que me siguen

module.exports = {
  pruebaFollow,
};
