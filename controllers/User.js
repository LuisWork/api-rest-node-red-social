// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador: controllers/User.js"
    })
};

module.exports = {
    pruebaUser
}