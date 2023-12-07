const Follow = require("../models/follow");
const User = require("../models/user");
const pagination = require("mongoose-pagination");

const pruebaFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: controllers/follow.js",
  });
};

const save = (req, res) => {
  const params = req.body;
  const identity = req.user;
  let userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });
  userToFollow.save((error, followStored) => {
    if (error || !followStored) {
      return res.status(500).send({
        status: "error",
        message: "No se a podido seguir al usuario",
      });
    }
    return res.status(200).send({
      status: "success",
      identity: req.user,
      follow: followStored,
    });
  });
};

const unfollow = (req, res) => {
  const userId = req.user.id;
  const followedId = req.params.id;
  Follow.find({
    user: userId,
    followed: followedId,
  }).remove((error, followDeleted) => {
    if (error || !followDeleted) {
      return res.status(500).send({
        status: "error",
        message: "Error al dejar de seguir",
      });
    }
    return res.status(500).send({
      status: "success",
      message: "Has dejado de seguir correctamente",
    });
  });
};

const following = (req, res) => {
  let userId = req.user.id;
  if (req.params.id) userId = req.params.id;
  let page = 1;
  if (req.params.page) page = req.params.page;
  const itemsPerPage = 5;
  Follow.find({ user: userId })
    .populate("user followed", "-password -role -__v")
    .paginate(page, itemsPerPage, (error, follows, total) => {
      return res.status(200).send({
        status: "success",
        message: "Listado de usuarios que estoy siguiendo",
        follows,
        total,
        usuarioLogeado: req.user.name,
      });
    });
};

const followers = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Metodo followers",
  });
};

module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
