const follow = require("../models/follow");
const user = require("../models/user");

// Acciones de prueba
const pruebaFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: controllers/follow.js",
  });
};

// Accion de seguir

const save = (req, res) => {
  // Conseguir datos por el body
  const params = req.body;

  // Sacar el ID del usuario identificado
  const identity = req.user;
  // Crear el objeto con modelo follow
  let userToFollow = new follow({
    user: identity.id,
    followed: params.followed,
  });

  // Guardar el objeto en la Database
  userToFollow.save((error, followStored) => {
    if (error || !followStored) {
      return res.status(500).send({
        status: "error",
        message: "No se a podido seguir al usuario",
      });
    }

    return res.status(200).send({
      message: "Metodo se seguir",
      userLogged: req.user,
      follow: followStored,
    });
  });
};

// Accion de dejar de seguir

const unfollow = (req, res) => {
  //Recoger el id del usuario identificado
  const userId = req.user.id;
  // Recoger el id del usuario que quiero dejar de seguir
  const followedId = req.params.id;

  // Find de las coincidencias y hacer remove
  follow
    .find({
      user: userId,
      followed: followedId,
    })
    .remove((error, followDeleted) => {
      if (error || !followDeleted) {
        return res.status(400).sent({
          status: "error",
          message: "Error al dejar de seguir",
        });
      }

      return res.status(500).send({
        status: 'success',
        message: 'Has dejado de seguir correctamente',
      });
    });
};

// Listado de usuarios que cualquier usuario esta siguiendo

// Accion de listar usuarios que me siguen

module.exports = {
  pruebaFollow,
  save,
  unfollow,
};
