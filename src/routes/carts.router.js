const { Router } = require('express');
const CartManager = require('../managers/CartManager.js'); // Importar el manager refactorizado

module.exports = function() { // Ya no necesita dataDir
    const cartsRouter = Router();
    const cartManager = new CartManager(); // Instanciar el manager refactorizado

    // POST /api/carts/ - Crea un nuevo carrito
    cartsRouter.post('/', async (req, res) => {
        try {
            const newCart = await cartManager.createCart();
            res.status(201).json({ status: 'success', payload: newCart });
        } catch (error) {
            console.error('Error al crear carrito:', error);
            res.status(500).json({ status: 'error', message: error.message });
        }
    });

    // GET /api/carts/:cid - Lista los productos que pertenecen al carrito con el cid proporcionado (con populate)
    cartsRouter.get('/:cid', async (req, res) => {
        try {
            const { cid } = req.params;
            const cart = await cartManager.getCartById(cid);
            res.json({ status: 'success', payload: cart.products }); // Devolver los productos populados
        } catch (error) {
            console.error(`Error al obtener carrito con ID ${req.params.cid}:`, error);
            res.status(404).json({ status: 'error', message: error.message });
        }
    });

    // POST /api/carts/:cid/product/:pid - Agrega el producto al arreglo products del carrito seleccionado
    cartsRouter.post('/:cid/product/:pid', async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const updatedCart = await cartManager.addProductToCart(cid, pid);
            res.json({ status: 'success', payload: updatedCart });
        } catch (error) {
            console.error(`Error al agregar producto ${req.params.pid} al carrito ${req.params.cid}:`, error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    // DELETE api/carts/:cid/products/:pid - Elimina del carrito el producto seleccionado
    cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const updatedCart = await cartManager.removeProductFromCart(cid, pid);
            res.json({ status: 'success', payload: updatedCart, message: 'Producto eliminado del carrito.' });
        } catch (error) {
            console.error(`Error al eliminar producto ${req.params.pid} del carrito ${req.params.cid}:`, error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    // PUT api/carts/:cid - Actualiza todos los productos del carrito con un arreglo de productos
    cartsRouter.put('/:cid', async (req, res) => {
        try {
            const { cid } = req.params;
            const newProductsArray = req.body.products; // Espera un array de productos en el body: { products: [{ product: 'productId', quantity: N }] }
            if (!Array.isArray(newProductsArray)) {
                return res.status(400).json({ status: 'error', message: 'El body debe contener un arreglo de productos.' });
            }
            const updatedCart = await cartManager.updateCartProducts(cid, newProductsArray);
            res.json({ status: 'success', payload: updatedCart, message: 'Carrito actualizado exitosamente.' });
        } catch (error) {
            console.error(`Error al actualizar carrito con ID ${req.params.cid}:`, error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    // PUT api/carts/:cid/products/:pid - Actualiza SÓLO la cantidad de ejemplares del producto
    cartsRouter.put('/:cid/products/:pid', async (req, res) => {
        try {
            const { cid, pid } = req.params;
            const { quantity } = req.body; // Espera la cantidad en el body: { quantity: N }

            if (typeof quantity !== 'number' || quantity < 0) {
                return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo.' });
            }

            const updatedCart = await cartManager.updateProductQuantityInCart(cid, pid, quantity);
            res.json({ status: 'success', payload: updatedCart, message: 'Cantidad de producto actualizada.' });
        } catch (error) {
            console.error(`Error al actualizar cantidad del producto ${req.params.pid} en el carrito ${req.params.cid}:`, error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    // DELETE api/carts/:cid - Elimina todos los productos del carrito
    cartsRouter.delete('/:cid', async (req, res) => {
        try {
            const { cid } = req.params;
            const updatedCart = await cartManager.clearCart(cid);
            res.json({ status: 'success', payload: updatedCart, message: 'Todos los productos del carrito han sido eliminados.' });
        } catch (error) {
            console.error(`Error al vaciar carrito con ID ${req.params.cid}:`, error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    return cartsRouter;
};
