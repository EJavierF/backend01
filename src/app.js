const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');

// Importar ProductManager para usarlo en los eventos de WebSocket
const ProductManager = require('./managers/ProductManager.js');

const app = express();
const PORT = 8080;

// Calcular la ruta absoluta a la carpeta 'src'
const srcDir = __dirname;
// Calcular la ruta absoluta a la carpeta 'data'
const dataDir = path.join(srcDir, 'data');

// Inicializar ProductManager con la ruta correcta
const productsFilePath = path.join(dataDir, 'products.json');
const productManager = new ProductManager(productsFilePath);

// Crear un servidor HTTP a partir de la aplicación Express
const httpServer = createServer(app);
// Inicializar Socket.IO y adjuntarlo al servidor HTTP
const io = new Server(httpServer);

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: false
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(srcDir, 'views'));

// Middleware para servir archivos estáticos (como el cliente de Socket.IO)
app.use(express.static(path.join(srcDir, 'public')));

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());
// Middleware para parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Importar los routers y pasarles las dependencias necesarias
const productsRouter = require('./routes/products.router.js');
const cartsRouter = require('./routes/carts.router.js');
const viewsRouter = require('./routes/views.router.js'); // Este router ahora maneja ambas vistas

app.use('/api/products', productsRouter(io, dataDir)); // Pasar 'io' y 'dataDir'
app.use('/api/carts', cartsRouter(dataDir)); // Pasar 'dataDir'
app.use('/', viewsRouter(dataDir)); // Pasar 'dataDir' al router de vistas

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado a través de WebSocket:', socket.id);

    // Escuchar evento para agregar producto desde realTimeProducts.handlebars (vía WebSocket)
    socket.on('addProductFromRT', async (productData) => {
        try {
            const addedProduct = await productManager.addProduct(productData);
            // Emitir el nuevo producto a TODOS los clientes conectados
            io.emit('newProduct', addedProduct);
            console.log('Producto agregado vía WebSocket:', addedProduct.title);
        } catch (error) {
            console.error('Error al agregar producto vía WebSocket:', error.message);
            // Emitir un error de vuelta al cliente que lo envió
            socket.emit('productError', { message: error.message });
        }
    });

    // Escuchar evento para eliminar producto desde realTimeProducts.handlebars (vía WebSocket)
    socket.on('deleteProductFromRT', async (productId) => {
        try {
            await productManager.deleteProduct(productId);
            // Emitir el ID del producto eliminado a TODOS los clientes
            io.emit('deletedProduct', productId);
            console.log('Producto eliminado vía WebSocket:', productId);
        } catch (error) {
            console.error('Error al eliminar producto vía WebSocket:', error.message);
            // Emitir un error de vuelta al cliente que lo envió
            socket.emit('productError', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Iniciar el servidor HTTP (no el app de Express directamente)
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Puedes acceder a la página de productos (HTTP) en: http://localhost:${PORT}`);
    console.log(`Puedes acceder a la página de productos (Real-Time) en: http://localhost:${PORT}/realtimeproducts`);
    console.log(`Las rutas API siguen disponibles en: http://localhost:${PORT}/api/products y http://localhost:${PORT}/api/carts`);
});
