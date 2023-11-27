// Importar dependencias y modulos
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: controllers/user.js",
  });
};

// Registro de usuarios
const guardarUsuario = (req, res) => {
  //Recoger datos de la peticion
  let params = req.body;
  //Comprobar que llegan (+Validacion)
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }
  // Control de usuarios duplicados
  User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nick: params.nick.toLowerCase() },
    ],
  }).exec(async (error, users) => {
    if (error)
      return res.status(500).json({
        status: "error",
        message: "Error al guardar el usuario",
      });

    if (users && users.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe",
      });
    }
    // Cifrar el password
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;
    // Crear objeto de usuario
    let userToSave = new User(params);
    // Guardar el usuario en la base de datos
    userToSave.save((error, userStored) => {
      if (error || !userStored) {
        return res.status(500).send({
          status: "error",
          message: "Error al guardar el usuario",
        });
      }
      // Devolver el resultado
      return res.status(200).json({
        satus: "success",
        message: "Usuario registrado correctamente",
        user: userStored,
      });
    });
  });
};

module.exports = {
  pruebaUser,
  guardarUsuario,
};
