const { Router } = require('express');
const ProductManager = require('../managers/ProductManager.js');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');
const productManager = new ProductManager(productsFilePath);

const viewsRouter = Router();

// Ruta para la página principal que muestra los productos y el formulario
viewsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products: products }); // Renderiza la vista 'home.handlebars'
    } catch (error) {
        console.error('Error al renderizar la vista de productos:', error);
        res.status(500).send('Error al cargar la página de productos.');
    }
});

module.exports = viewsRouter;

