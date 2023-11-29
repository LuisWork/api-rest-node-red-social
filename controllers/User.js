// Importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");

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

const login = (req, res) => {
  // Recoger los parametros del body
  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  // Buscar en la base de datos si existen las credenciales
  User.findOne({ email: params.email }) /*.select({"password": 0})*/
    .exec((error, user) => {
      if (error || !user) {
        return res.status(404).send({
          status: "error",
          message: "No existe el usuario",
        });
      }

      // Comprobar su password
      const pwd = bcrypt.compareSync(params.password, user.password);

      if (!pwd) {
        return res.status(400).send({
          status: "error",
          message: "No te has identificado correctamente",
        });
      }

      // Conseguir Token
      const token = jwt.createToken(user);

      // Devolver los datos del usuario
      return res.status(200).send({
        status: "success",
        message: "Te has identificado correctamente",
        user: {
          id: user.id,
          name: user.name,
          nick: user.nick,
        },
        token,
      });
    });
};

module.exports = {
  pruebaUser,
  guardarUsuario,
  login,
};
