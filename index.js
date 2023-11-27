// Importar dependencias
const { connection } = require("./database/connection");
const express = require('express');
const cors = require('cors');

// Mensaje de bienvenida
console.log("API NODE para Red Social Inicializada");

// Conexion a la BBDD
connection();

// Crear servidor de Node
const app = express();
const puerto = 3900;

// Configurar CORS
app.use(cors());

// Convertir los datos del body a objetos JSON
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar la configuracion de rutas
const userRoutes = require('./routes/user');
const publicationRoutes = require('./routes/publication');
const followRoutes = require('./routes/follow');

app.use("/api", userRoutes);
app.use("/api", publicationRoutes);
app.use("/api", followRoutes);

// Ruta de prueba
app.get("/prueba", (req, res) => {
    return res.status(200).json({
        "id": 1,
        "nombre": "Luis",
        "web": "https://github.com/LuisWork"
    });
});

// Poner servidor a escuchar peticiones HTTP
app.listen(puerto, () => {
    console.log("Servidor de Node.JS corriendo en el puerto: " + puerto);
});