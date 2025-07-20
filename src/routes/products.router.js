const { Router } = require('express');
const ProductManager = require('../managers/ProductManager.js'); // Importar el manager refactorizado

module.exports = function(io) { // Recibe la instancia de Socket.IO
    const productsRouter = Router();
    const productManager = new ProductManager(); // Instanciar el manager refactorizado

    // GET /api/products/ - Lista todos los productos con paginación, filtros y ordenamiento
    productsRouter.get('/', async (req, res) => {
        try {
            const { limit, page, sort, query } = req.query;

            // Parsear el parámetro 'query' si es una cadena JSON
            let parsedQuery = {};
            if (query) {
                try {
                    parsedQuery = JSON.parse(query);
                } catch (e) {
                    // Si no es un JSON válido, intentar tratarlo como un filtro por categoría o status
                    // Esto permite URLs como ?query=Electronics o ?query={"status":true}
                    if (query === 'true' || query === 'false') {
                        parsedQuery.status = (query === 'true');
                    } else {
                        parsedQuery.category = query;
                    }
                }
            }

            const productsData = await productManager.getProductsPaginated(limit, page, sort, parsedQuery);

            // Construir prevLink y nextLink con todos los parámetros de la query
            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
            const buildLink = (pageNum) => {
                const params = new URLSearchParams();
                if (limit) params.append('limit', limit);
                if (pageNum) params.append('page', pageNum);
                if (sort) params.append('sort', sort);
                if (query) params.append('query', query); // Mantener el query original
                return `${baseUrl}?${params.toString()}`;
            };

            productsData.prevLink = productsData.hasPrevPage ? buildLink(productsData.prevPage) : null;
            productsData.nextLink = productsData.hasNextPage ? buildLink(productsData.nextPage) : null;

            res.json(productsData);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener productos.' });
        }
    });

    // GET /api/products/:pid - Trae solo el producto con el ID proporcionado
    productsRouter.get('/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const product = await productManager.getProductById(pid);
            res.json({ status: 'success', payload: product });
        } catch (error) {
            console.error(`Error al obtener producto con ID ${req.params.pid}:`, error);
            res.status(404).json({ status: 'error', message: error.message });
        }
    });

    // POST /api/products/ - Agrega un nuevo producto
    productsRouter.post('/', async (req, res) => {
        try {
            const newProductData = req.body;
            const addedProduct = await productManager.addProduct(newProductData);
            io.emit('newProduct', addedProduct); // Emitir el nuevo producto a todos los clientes conectados
            res.status(201).json({ status: 'success', payload: addedProduct });
        } catch (error) {
            console.error('Error al agregar producto:', error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    // PUT /api/products/:pid - Actualiza un producto por los campos enviados desde el body
    productsRouter.put('/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const updatedFields = req.body;
            const updatedProduct = await productManager.updateProduct(pid, updatedFields);
            io.emit('updatedProduct', updatedProduct); // Emitir actualización de producto
            res.json({ status: 'success', payload: updatedProduct });
        } catch (error) {
            console.error(`Error al actualizar producto con ID ${req.params.pid}:`, error);
            res.status(400).json({ status: 'error', message: error.message });
        }
    });

    // DELETE /api/products/:pid - Elimina el producto con el pid indicado
    productsRouter.delete('/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const result = await productManager.deleteProduct(pid);
            io.emit('deletedProduct', pid); // Emitir evento de producto eliminado
            res.json({ status: 'success', message: result.message });
        } catch (error) {
            console.error(`Error al eliminar producto con ID ${req.params.pid}:`, error);
            res.status(404).json({ status: 'error', message: error.message });
        }
    });

    return productsRouter;
};
