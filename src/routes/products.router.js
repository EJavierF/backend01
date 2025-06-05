import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsFilePath = path.resolve(__dirname, '../data/products.json');
const productManager = new ProductManager(productsFilePath);

const productsRouter = Router();

// GET /api/products/
productsRouter.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:pid
productsRouter.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /api/products/
productsRouter.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        const addedProduct = await productManager.addProduct(newProduct);
        res.status(201).json(addedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:pid
productsRouter.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedFields = req.body;
        const updatedProduct = await productManager.updateProduct(pid, updatedFields);
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/products/:pid
productsRouter.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const result = await productManager.deleteProduct(pid);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default productsRouter;