const express = require('express');
const cartsRouter = express.Router();
const CartManager = require('../managers/CartManager.js');
const path = require('path');
//const { fileURLToPath } = require('url');

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const cartsFilePath = path.resolve(__dirname, '../data/carts.json');
const cartManager = new CartManager(cartsFilePath);

//const cartsRouter = Router();

// POST /api/carts/
cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/carts/:cid
cartsRouter.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        res.json(cart.products); // Devolver solo los productos del carrito
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /api/carts/:cid/product/:pid
cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = cartsRouter;