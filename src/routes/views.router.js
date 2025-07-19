const { Router } = require('express');
const ProductManager = require('../managers/ProductManager.js');
const path = require('path');

// Este router ahora acepta la ruta absoluta a la carpeta de datos
module.exports = function(dataDir) {
    const viewsRouter = Router();

    // Construir la ruta absoluta al archivo products.json usando dataDir
    const productsFilePath = path.join(dataDir, 'products.json');
    const productManager = new ProductManager(productsFilePath);

    // Ruta para la página principal (home.handlebars)
    viewsRouter.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.render('home', { products: products }); // Renderiza la vista 'home.handlebars'
        } catch (error) {
            console.error('Error al renderizar la vista home:', error);
            res.status(500).send('Error al cargar la página principal de productos.');
        }
    });

    // NUEVA RUTA: /realtimeproducts (realTimeProducts.handlebars)
    viewsRouter.get('/realtimeproducts', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.render('realTimeProducts', { products: products }); // Renderiza la vista 'realTimeProducts.handlebars'
        } catch (error) {
            console.error('Error al renderizar la vista realTimeProducts:', error);
            res.status(500).send('Error al cargar la página de productos en tiempo real.');
        }
    });

    return viewsRouter;
};
