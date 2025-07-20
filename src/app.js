const express = require('express');
const { createServer } = require('http'); // Necesario para Socket.IO
const { Server } = require('socket.io'); // Importar Server de socket.io
const exphbs = require('express-handlebars'); // Importar express-handlebars
const path = require('path'); // Para manejar rutas de archivos

// Importar la configuración de la base de datos y los managers
const connectDB = require('./db/config');
const ProductManager = require('./managers/ProductManager.js'); // Importar el manager de productos
// No necesitamos importar CartManager aquí directamente, ya que se instancia en su propio router

const app = express();
const PORT = 8080;

// Conectar a la base de datos MongoDB
connectDB();

// Calcular la ruta absoluta a la carpeta 'src'
// __dirname en app.js es la ruta al directorio 'src'
const srcDir = __dirname;

// Inicializar ProductManager para usarlo en los eventos de WebSocket
// Ya no necesita una ruta de archivo porque interactúa con Mongoose
const productManager = new ProductManager();

// Crear un servidor HTTP a partir de la aplicación Express
const httpServer = createServer(app);
// Inicializar Socket.IO y adjuntarlo al servidor HTTP
const io = new Server(httpServer);

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: false // No usar un layout por defecto, las vistas son completas
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(srcDir, 'views')); // Establecer la ruta de las vistas

// Middleware para servir archivos estáticos (CSS, JS del cliente, imágenes, etc.)
app.use(express.static(path.join(srcDir, 'public')));

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());
// Middleware para parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Importar los routers y pasarles las dependencias necesarias
// productsRouter necesita 'io' para emitir eventos de WebSocket
// cartsRouter y viewsRouter no necesitan 'dataDir' ya que los managers ahora usan Mongoose
const productsRouter = require('./routes/products.router.js');
const cartsRouter = require('./routes/carts.router.js');
const viewsRouter = require('./routes/views.router.js');

app.use('/api/products', productsRouter(io)); // Pasar 'io' al router de productos
app.use('/api/carts', cartsRouter()); // Ya no necesita dataDir
app.use('/', viewsRouter()); // Ya no necesita dataDir al instanciar managers

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
    console.log(`Puedes acceder a la página de productos (HTTP) en: http://localhost:${PORT}/products`);
    console.log(`Puedes acceder a la página de productos (Real-Time) en: http://localhost:${PORT}/realtimeproducts`);
    console.log(`Las rutas API siguen disponibles en: http://localhost:${PORT}/api/products y http://localhost:${PORT}/api/carts`);
});
