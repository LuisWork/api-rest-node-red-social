// Importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: controllers/user.js",
    user: req.user,
  });
};

const guardarUsuario = (req, res) => {
  let params = req.body;
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }
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
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;
    let userToSave = new User(params);
    userToSave.save((error, userStored) => {
      if (error || !userStored) {
        return res.status(500).send({
          status: "error",
          message: "Error al guardar el usuario",
        });
      }
      return res.status(200).json({
        satus: "success",
        message: "Usuario registrado correctamente",
        user: userStored,
      });
    });
  });
};

const login = (req, res) => {
  let params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  User.findOne({ email: params.email }).exec((error, user) => {
    if (error || !user) {
      return res.status(404).send({
        status: "error",
        message: "No existe el usuario",
      });
    }

    const pwd = bcrypt.compareSync(params.password, user.password);

    if (!pwd) {
      return res.status(400).send({
        status: "error",
        message: "No te has identificado correctamente",
      });
    }

    const token = jwt.createToken(user);

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
  const id = req.params.id;
  User.findById(id)
    .select({ password: 0, role: 0 })
    .exec((error, userProfile) => {
      if (error || !userProfile) {
        return res.status(404).send({
          status: "error",
          message: "El usuario no existe o hay un error",
        });
      }
      return res.status(200).send({
        status: "success",
        user: userProfile,
      });
    });
};

const list = (req, res) => {
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  page = parseInt(page);

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
  let userIdentity = req.user;
  const userToUpdate = req.body;
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;
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

    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    }

    try {
      let userUpdated = await User.findByIdAndUpdate(
        { _id: userIdentity.id },
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
  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "La peticion no incluye la imagen",
    });
  }
  let image = req.file.originalname;
  const imageSplit = image.split(".");
  const extension = imageSplit[1];

  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    const filePath = req.file.path;
    const fileDeleted = fs.unlinkSync(filePath);
    return res.status(400).send({
      status: "error",
      message: "Extension del fichero invalida",
    });
  }
  try {
    let updatedUser = await User.findByIdAndUpdate(
      {
        _id: req.user.id,
      },
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
  const file = req.params.file;
  // Montar el path real de la imagen
  const filePath = "./uploads/avatars/" + file;
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }
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
