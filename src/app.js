//import express from 'express';
const express = require('express');
//import productsRouter from './routes/products.router.js';
const productsRouter = require('./routes/products.router')
//import cartsRouter from './routes/carts.router.js';
const cartsRouter = require('./routes/carts.router');
const path = require('path'); // Add this at the top if not already there
// ...

const app = express();
const handlebars = require('express-handlebars');
const PORT = 8080;

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Inicializo handlebars
app.engine('handlebars', handlebars.engine())
//app.set('views','./views')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars')
//app.use(express.static('./views'))

// Rutas
//app.use('/api/products', productsRouter);
//app.use('/api/carts', cartsRouter);
app.use('/', productsRouter);
app.use('/', cartsRouter);

// Ruta de prueba
//app.get('/', (req, res) => {
//    res.send('¡Arrancó el servidor!');
//});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
});