const { Router } = require('express');
const CartManager = require('../managers/CartManager.js');
const path = require('path'); // Asegúrate de que path esté requerido aquí

// Este router ahora acepta la ruta absoluta a la carpeta de datos
module.exports = function(dataDir) {
    const cartsRouter = Router();

    // Construir la ruta absoluta al archivo carts.json usando dataDir
    const cartsFilePath = path.join(dataDir, 'carts.json');
    const cartManager = new CartManager(cartsFilePath);

    // POST /api/carts/ - Crea un nuevo carrito
    cartsRouter.post('/', async (req, res) => {
        try {
            const newCart = await cartManager.createCart();
            res.status(201).json(newCart);
        } catch (error) {
            console.error('Error al crear carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor al crear carrito.' });
        }
    });

    // GET /api/carts/:cid - Lista los productos de un carrito específico
    cartsRouter.get('/:cid', async (req, res) => {
        try {
            const { cid } = req.params;
            const cart = await cartManager.getCartById(cid);
            res.json(cart.products);
        } catch (error) {
            console.error(`Error al obtener carrito con ID ${req.params.cid}:`, error);
            res.status(404).json({ error: error.message });
        }
    });

    // POST /api/carts/:cid/product/:pid - Agrega un producto a un carrito
    cartsRouter.post('/:cid/product/:pid', async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const updatedCart = await cartManager.addProductToCart(cid, pid);
            res.json(updatedCart);
        } catch (error) {
            console.error(`Error al agregar producto ${req.params.pid} al carrito ${req.params.cid}:`, error);
            res.status(400).json({ error: error.message });
        }
    });

    return cartsRouter;
};
