const { Router } = require('express');
const ProductManager = require('../managers/ProductManager.js');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');
const productManager = new ProductManager(productsFilePath);

// Este router ahora acepta una instancia de Socket.IO
module.exports = function(io) {
    const productsRouter = Router();

    // GET /api/products/ - Lista todos los productos
    productsRouter.get('/', async (req, res) => {
        try {
            const products = await productManager.getProducts();
            res.json(products);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ error: 'Error interno del servidor al obtener productos.' });
        }
    });

    // GET /api/products/:pid - Trae un producto por su ID
    productsRouter.get('/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const product = await productManager.getProductById(pid);
            res.json(product);
        } catch (error) {
            console.error(`Error al obtener producto con ID ${req.params.pid}:`, error);
            res.status(404).json({ error: error.message });
        }
    });

    // POST /api/products/ - Agrega un nuevo producto
    productsRouter.post('/', async (req, res) => {
        try {
            const newProduct = req.body;
            const addedProduct = await productManager.addProduct(newProduct);
            // Emitir el nuevo producto a todos los clientes conectados a través de WebSockets
            io.emit('newProduct', addedProduct);
            res.status(201).json(addedProduct);
        } catch (error) {
            console.error('Error al agregar producto:', error);
            res.status(400).json({ error: error.message });
        }
    });

    // PUT /api/products/:pid - Actualiza un producto por su ID
    productsRouter.put('/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const updatedFields = req.body;
            const updatedProduct = await productManager.updateProduct(pid, updatedFields);
            // Opcional: Emitir actualización de producto si es necesario para la vista
            io.emit('updatedProduct', updatedProduct);
            res.json(updatedProduct);
        } catch (error) {
            console.error(`Error al actualizar producto con ID ${req.params.pid}:`, error);
            res.status(400).json({ error: error.message });
        }
    });

    // DELETE /api/products/:pid - Elimina un producto por su ID
    productsRouter.delete('/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const result = await productManager.deleteProduct(pid);
            // Emitir evento de producto eliminado
            io.emit('deletedProduct', pid);
            res.json(result);
        } catch (error) {
            console.error(`Error al eliminar producto con ID ${req.params.pid}:`, error);
            res.status(404).json({ error: error.message });
        }
    });

    return productsRouter;
};

