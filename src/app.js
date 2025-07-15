const express = require('express');
const { createServer } = require('http'); // Necesario para Socket.IO
const { Server } = require('socket.io'); // Importar Server de socket.io
const exphbs = require('express-handlebars'); // Importar express-handlebars
const path = require('path');

const productsRouter = require('./routes/products.router.js'); // Ahora es una función que recibe 'io'
const cartsRouter = require('./routes/carts.router.js');
const viewsRouter = require('./routes/views.router.js'); // Nuevo router para las vistas

const app = express();
const PORT = 8080;

// Crear un servidor HTTP a partir de la aplicación Express
const httpServer = createServer(app);
// Inicializar Socket.IO y adjuntarlo al servidor HTTP
const io = new Server(httpServer);

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: false // No usar un layout por defecto, la vista home.handlebars es completa
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Establecer la ruta de las vistas

// Middleware para servir archivos estáticos (como el cliente de Socket.IO)
app.use(express.static(path.join(__dirname, 'public'))); // Si tuvieras archivos CSS/JS estáticos

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());
// Middleware para parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Monta los routers
// Pasar la instancia de io al productsRouter para que pueda emitir eventos
app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter); // La ruta raíz ahora sirve la página de Handlebars

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado a través de WebSocket:', socket.id);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Iniciar el servidor HTTP (no el app de Express directamente)
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Puedes acceder a la página de productos en: http://localhost:${PORT}`);
    console.log(`Las rutas API siguen disponibles en: http://localhost:${PORT}/api/products y http://localhost:${PORT}/api/carts`);
});

