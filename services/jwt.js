// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta
const secret = "CLAVE_SECRETA_DEL_PROYECTO_RED_SOCIAL_123";

// Crear una funcion para generar tokens
const createToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  // Devolver JWT Token codificado
  return jwt.encode(payload, secret);
};

module.exports = {
  secret,
  createToken
}