// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador: controllers/Publication.js"
    })
};

module.exports = {
    pruebaPublication
}