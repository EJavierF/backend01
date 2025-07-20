const { Router } = require('express');
const ProductManager = require('../managers/ProductManager.js'); // Importar el manager refactorizado
const CartManager = require('../managers/CartManager.js'); // Importar el manager refactorizado

module.exports = function() { // Ya no necesita dataDir
    const viewsRouter = Router();
    const productManager = new ProductManager(); // Instanciar manager
    const cartManager = new CartManager(); // Instanciar manager

    // Ruta principal: Redireccionar a /products
    viewsRouter.get('/', (req, res) => {
        res.redirect('/products');
    });

    // Ruta para la página principal de productos (home.handlebars)
    viewsRouter.get('/products', async (req, res) => {
        try {
            const { limit, page, sort, query } = req.query;

            let parsedQuery = {};
            if (query) {
                try {
                    parsedQuery = JSON.parse(query);
                } catch (e) {
                    if (query === 'true' || query === 'false') {
                        parsedQuery.status = (query === 'true');
                    } else {
                        parsedQuery.category = query;
                    }
                }
            }

            const productsData = await productManager.getProductsPaginated(limit, page, sort, parsedQuery);

            // Construir los links de paginación para la vista
            const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`; // /products
            const buildLink = (pageNum) => {
                const params = new URLSearchParams();
                if (limit) params.append('limit', limit);
                if (pageNum) params.append('page', pageNum);
                if (sort) params.append('sort', sort);
                if (query) params.append('query', query);
                return `${baseUrl}?${params.toString()}`;
            };

            res.render('home', {
                products: productsData.payload,
                pagination: {
                    totalPages: productsData.totalPages,
                    prevPage: productsData.prevPage,
                    nextPage: productsData.nextPage,
                    page: productsData.page,
                    hasPrevPage: productsData.hasPrevPage,
                    hasNextPage: productsData.hasNextPage,
                    prevLink: productsData.hasPrevPage ? buildLink(productsData.prevPage) : null,
                    nextLink: productsData.hasNextPage ? buildLink(productsData.nextPage) : null,
                    limit: limit || 10,
                    sort: sort || '',
                    query: query || '' // Pasar el query original para que el formulario lo mantenga
                }
            });
        } catch (error) {
            console.error('Error al renderizar la vista home (products):', error);
            res.status(500).send('Error al cargar la página de productos.');
        }
    });

    // NUEVA RUTA: /products/:pid - Vista de detalle de un producto específico
    viewsRouter.get('/products/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const product = await productManager.getProductById(pid);
            res.render('productDetail', { product: product });
        } catch (error) {
            console.error(`Error al renderizar detalle de producto con ID ${req.params.pid}:`, error);
            res.status(404).send('Producto no encontrado.');
        }
    });

    // NUEVA RUTA: /carts/:cid - Vista de detalle de un carrito específico
    viewsRouter.get('/carts/:cid', async (req, res) => {
        try {
            const { cid } = req.params;
            const cart = await cartManager.getCartById(cid);
            res.render('cartDetail', { cart: cart });
        } catch (error) {
            console.error(`Error al renderizar detalle de carrito con ID ${req.params.cid}:`, error);
            res.status(404).send('Carrito no encontrado.');
        }
    });

    // Ruta para realTimeProducts.handlebars
    viewsRouter.get('/realtimeproducts', async (req, res) => {
        try {
            const productsData = await productManager.getProductsPaginated(100); // Obtener todos los productos para la vista en tiempo real
            res.render('realTimeProducts', { products: productsData.payload });
        } catch (error) {
            console.error('Error al renderizar la vista realTimeProducts:', error);
            res.status(500).send('Error al cargar la página de productos en tiempo real.');
        }
    });

    return viewsRouter;
};
