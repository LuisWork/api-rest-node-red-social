// Importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// Acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: controllers/user.js",
    user: req.user,
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

const profile = (req, res) => {
  // Recibir el parametro del id de usuario por la URL
  const id = req.params.id;
  // Consulta para sacar los datos del usuario
  //const userProfile = await User.findById(id)
  User.findById(id)
    .select({ password: 0, role: 0 })
    .exec((error, userProfile) => {
      if (error || !userProfile) {
        return res.status(404).send({
          status: "error",
          message: "El usuario no existe o hay un error",
        });
      }
      // Devolver el resultado
      // Posteriormente devolver informacion de follows
      return res.status(200).send({
        status: "success",
        user: userProfile,
      });
    });
};

const list = (req, res) => {
  // Controlar en que pagina estamos

  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  page = parseInt(page);

  // Hacer la consulta con Mongoose pagination

  let itemsPerPage = 5;

  User.find()
    .sort("_id")
    .paginate(page, itemsPerPage, (error, users, total) => {
      if (error || !users) {
        return res.status(404).send({
          status: "error",
          message: "No hay usuarios disponibles para mostrar",
          error,
        });
      }
      // Devolver el resultado (Posteriormente info de follows)
      return res.status(200).send({
        users,
        page,
        itemsPerPage,
        total,
        pages: Math.ceil(total / itemsPerPage),
      });
    });
};

const update = (req, res) => {
  // Recoger info del usuario a actualizar
  let userIdentity = req.user;
  const userToUpdate = req.body;
  // Eliminar campos sobrantes
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;
  // Comprobar si el usuario ya existe
  User.find({
    $or: [
      { email: userToUpdate.email.toLowerCase() },
      { nick: userToUpdate.nick.toLowerCase() },
    ],
  }).exec(async (error, users) => {
    if (error)
      return res.status(500).json({
        status: "error",
        message: "Error en la consulta de usuarios",
      });

    let userIsset = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) {
        userIsset = true;
      }
    });

    if (userIsset) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe",
      });
    }

    // Cifrar la password
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    }

    // Buscar y actualizar
    try {
      let userUpdated = await User.findByIdAndUpdate(
        userIdentity.id,
        userToUpdate,
        { new: true }
      );

      if (!userUpdated) {
        return res.status(400).json({
          status: "error",
          message: "Error al actualizar el usuario",
        });
      }

      return res.status(200).send({
        status: "success",
        message: "Metodo de actualizar usuario",
        user: userUpdated,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error al actualizar el usuario",
      });
    }
  });
};

const upload = async (req, res) => {
  // Recoger el fichero de imagen y comprobar que existe
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "La peticion no incluye la imagen",
    });
  }
  // Conseguir el nombre del archivo
  let image = req.file.originalname;
  // Sacar la extension del archivo
  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  // Comprobar extension
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    // Si no es correcta, borrar archivo
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);
    //Devolver respuesta negativa
    return res.status(400).send({
      status: "error",
      message: "Extension del fichero invalida",
    });
  }
  try {
    // Si si es correcta, guardar imagen en bbdd
    let updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { image: req.file.filename },
      { new: true }
    );
    return res.status(200).send({
      status: "success",
      message: "Image uploaded",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Error while updating image",
    });
  }
};

const avatar = (req, res) => {
  // Sacar el parametro de la url
  const file = req.params.file;
  // Montar el path real de la imagen
  const filePath = "./uploads/avatars/" + file;
  // Comprobar que existe
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }
    // Devolver un file
    return res.sendFile(path.resolve(filePath));
  });
};

module.exports = {
  pruebaUser,
  guardarUsuario,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
};
